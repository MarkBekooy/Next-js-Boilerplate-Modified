import { NextResponse } from "next/server";
import { getPostHogServer } from "@/libs/posthog-server";

const posthog = getPostHogServer();

export function GET() {
  try {
    throw new Error(
      "This is a test exception for error tracking from the backend API",
    );
  } catch (error) {
    posthog.captureException(error, "test-user-123");

    return NextResponse.json(
      { error: "Internal Server Error which should be captured by PostHog" },
      { status: 500 },
    );
  }
}
