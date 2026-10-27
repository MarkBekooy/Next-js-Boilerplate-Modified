import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

const isProduction =
  (process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV) ===
  "production";

const previewHost =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ? process.env.NEXT_PUBLIC_VERCEL_URL : undefined;

function requiredInProduction<T extends z.ZodType>(schema: T) {
  return isProduction ? schema : schema.optional();
}

export const Env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    ARCJET_KEY: z.string().startsWith("ajkey_").optional(),
    CLERK_SECRET_KEY: requiredInProduction(z.string().startsWith("sk_").min(1)),
    CLERK_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
    DATABASE_URL: z.string().min(1),
    POSTHOG_API_KEY: z.string().optional(),
    POSTHOG_PROJECT_ID: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: requiredInProduction(z.url()),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: z.string().optional(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith("pk_").min(1),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().startsWith("phc_").min(1),
    NEXT_PUBLIC_POSTHOG_HOST: z.url(),
  },
  shared: {
    NODE_ENV: z.enum(["test", "development", "production"]).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    ARCJET_KEY: process.env.ARCJET_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID,
    NEXT_PUBLIC_APP_URL: previewHost ? `https://${previewHost}` : process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NODE_ENV: process.env.NODE_ENV,
  },
  createFinalSchema: (schemas, isServer) =>
    z
      .object(schemas)
      .refine(
        (env) =>
          Boolean(env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN) ===
          Boolean(env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST),
        {
          message:
            "NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN and NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST must be set together",
          path: ["NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN"],
        },
      )
      .refine(
        (env) => !isServer || Boolean(env.POSTHOG_API_KEY) === Boolean(env.POSTHOG_PROJECT_ID),
        {
          message: "POSTHOG_API_KEY and POSTHOG_PROJECT_ID must be set together",
          path: ["POSTHOG_API_KEY"],
        },
      ),
});
