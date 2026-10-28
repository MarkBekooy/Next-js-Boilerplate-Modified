import { NextResponse } from "next/server";

import { getPostHogServer } from "@/libs/posthog-server";
import { tryCatch } from "@/utils/try-catch";

const posthog = getPostHogServer();

export function GET() {
  const { error: backendTestError } = tryCatch(() => {
    throw new Error(
      "This is a test exception for error tracking from the backend API"
    );
  });

  posthog.captureException(backendTestError, "test-user-123");

  return NextResponse.json(
    { error: "Internal Server Error which should be captured by PostHog" },
    { status: 500 }
  );
}
