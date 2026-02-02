import * as Sentry from "@sentry/nextjs";
import { getPostHogServer } from "@/libs/posthog-server";
import { tryCatch } from "@/utils/try-catch";

const POSTHOG_COOKIE_REGEX = /ph_phc_.*?_posthog=([^;]+)/;

type PostHogCookieData = {
  distinct_id: string;
  [key: string]: unknown;
};

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  // Sentry DSN
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Enable Spotlight in development
  spotlight: process.env.NODE_ENV === "development",

  integrations: [
    Sentry.consoleLoggingIntegration(),
  ],

  // Adds request headers and IP for users, for more info visit
  sendDefaultPii: true,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
};

export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node.js Sentry configuration
      Sentry.init(sentryOptions);
    }

    if (process.env.NEXT_RUNTIME === "edge") {
    // Edge Sentry configuration
      Sentry.init(sentryOptions);
    }
  }
}

export const onRequestError = async (
  err: unknown,
  request: { headers: { cookie?: string | string[] } },
  context: unknown,
) => {
  // Capture error with Sentry
  Sentry.captureRequestError(err, request as any, context as any);

  // Capture error with PostHog (only in Node.js runtime)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const posthog = getPostHogServer();
    let distinctId: string | null = null;

    if (request.headers.cookie) {
      // Normalize multiple cookie arrays to string
      const cookieString = Array.isArray(request.headers.cookie)
        ? request.headers.cookie.join("; ")
        : request.headers.cookie;

      const postHogCookieMatch = cookieString.match(POSTHOG_COOKIE_REGEX);
      const cookieValue = postHogCookieMatch?.at(1);

      if (cookieValue) {
        const { data: decodedCookie, error: decodeError } = tryCatch(() =>
          decodeURIComponent(cookieValue),
        );

        if (!decodeError && decodedCookie) {
          const { data: postHogData, error: parseError } = tryCatch<PostHogCookieData, Error>(() =>
            JSON.parse(decodedCookie) as PostHogCookieData,
          );

          if (!parseError && postHogData?.distinct_id) {
            distinctId = postHogData.distinct_id;
          }
        }
      }
    }

    await posthog.captureException(err, distinctId || undefined);
  }
};
