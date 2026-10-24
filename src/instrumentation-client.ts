import posthog from "posthog-js";
import { Env } from "./libs/Env";

// Initialize PostHog
posthog.init(Env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: "/relay-FBSt",
  ui_host: "https://eu.posthog.com",
  defaults: "2026-08-30",
  tracing_headers: [
    "localhost",
    ...(Env.NEXT_PUBLIC_APP_URL
      ? [new URL(Env.NEXT_PUBLIC_APP_URL).hostname]
      : []),
  ],
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
  debug: Env.NODE_ENV === "development",
});
