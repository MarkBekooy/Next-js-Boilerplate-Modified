import type { Instrumentation } from "next";

import { tryCatch } from "@/utils/try-catch";

type OnRequestError = Instrumentation.onRequestError;

export async function onRequestError(
  error: Parameters<OnRequestError>[0],
  request: Parameters<OnRequestError>[1]
) {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const distinctIdHeader = request.headers["x-posthog-distinct-id"];
  const sessionIdHeader = request.headers["x-posthog-session-id"];

  const distinctId = Array.isArray(distinctIdHeader)
    ? distinctIdHeader[0]
    : distinctIdHeader;

  const sessionId = Array.isArray(sessionIdHeader)
    ? sessionIdHeader[0]
    : sessionIdHeader;

  const { error: posthogCaptureError } = await tryCatch(async () => {
    const { getPostHogDistinctId, getPostHogServer } =
      await import("@/libs/posthog-server");

    await getPostHogServer().captureExceptionImmediate(
      error,
      distinctId || getPostHogDistinctId(request.headers.cookie),
      { $session_id: sessionId }
    );
  });

  if (posthogCaptureError) {
    const { logger } = await import("@/libs/logger");

    logger.error("Could not capture PostHog request error", {
      error: posthogCaptureError,
    });
  }
}
