import { NextResponse } from "next/server";

import { logger } from "@/libs/logger";
import { getPostHogServer } from "@/libs/posthog-server";
import { tryCatch } from "@/utils/try-catch";

const posthog = getPostHogServer();

export async function GET() {
  const { error: backendTestError } = tryCatch(() => {
    throw new Error(
      "This is a test exception for error tracking from the backend API"
    );
  });

  const { error: posthogCaptureError } = await tryCatch(() =>
    posthog.captureExceptionImmediate(backendTestError, "test-user-123")
  );

  if (posthogCaptureError) {
    logger.error("Could not capture PostHog demo error", {
      error: posthogCaptureError,
    });
  }

  return NextResponse.json(
    { error: "Internal Server Error which should be captured by PostHog" },
    { status: 500 }
  );
}
