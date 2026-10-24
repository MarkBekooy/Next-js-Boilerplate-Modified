import type { Instrumentation } from "next";
import { getPostHogServer } from "@/libs/posthog-server";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const posthog = getPostHogServer();
  const distinctId = request.headers["x-posthog-distinct-id"];
  const sessionId = request.headers["x-posthog-session-id"];

  await posthog.captureException(
    error,
    Array.isArray(distinctId) ? distinctId[0] : distinctId,
    {
      $session_id: Array.isArray(sessionId) ? sessionId[0] : sessionId,
    },
  );
};
