import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("app URL validation", () => {
  beforeEach(() => {
    vi.stubGlobal("window", undefined);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", undefined);
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", undefined);
    vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", undefined);
    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_fixture");
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/test");
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_fixture");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_fixture");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://example.com");
    vi.stubEnv("NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN", undefined);
    vi.stubEnv("NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST", undefined);
    vi.stubEnv("POSTHOG_API_KEY", undefined);
    vi.stubEnv("POSTHOG_PROJECT_ID", undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("allows a preview server without an app URL", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    await expect(import("./env")).resolves.toHaveProperty(
      "Env.NEXT_PUBLIC_APP_URL",
      undefined
    );
  });

  it("allows a preview browser without public deployment variables", async () => {
    vi.stubGlobal("window", {});
    await expect(import("./env")).resolves.toHaveProperty(
      "Env.NEXT_PUBLIC_APP_URL",
      undefined
    );
  });

  it("requires an app URL on a production server", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    await expect(import("./env")).rejects.toThrow(
      "Invalid environment variables"
    );
  });

  it("accepts a production server with a valid app URL", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    await expect(import("./env")).resolves.toHaveProperty(
      "Env.NEXT_PUBLIC_APP_URL",
      "https://example.com"
    );
  });

  it("rejects malformed app URLs in the browser", async () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "invalid-url");
    await expect(import("./env")).rejects.toThrow(
      "Invalid environment variables"
    );
  });
});
