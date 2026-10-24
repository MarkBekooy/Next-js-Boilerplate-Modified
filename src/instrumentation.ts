import type { Instrumentation } from "next";
import { tryCatch } from "@/utils/try-catch";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
) => {
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
    const { getPostHogServer } = await import("@/libs/posthog-server");
    const posthog = getPostHogServer();

    await posthog.captureExceptionImmediate(error, distinctId, {
      $session_id: sessionId,
    });
  });

  if (posthogCaptureError) {
    console.error("Could not capture PostHog request error", posthogCaptureError);
  }
};
