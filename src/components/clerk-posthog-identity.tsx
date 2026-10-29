"use client";

import { useAuth } from "@clerk/nextjs";

import { PostHogIdentity } from "@/components/posthog-identity";

export function ClerkPostHogIdentity() {
  const { userId } = useAuth({ treatPendingAsSignedOut: false });

  return <PostHogIdentity userId={userId} />;
}
