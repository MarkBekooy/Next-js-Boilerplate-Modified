"use client";

import { posthog } from "posthog-js";
import { useEffect } from "react";

type PostHogIdentityProps = {
  // Preserve identity while auth loads; null confirms the user signed out.
  userId: string | null | undefined;
};

export function PostHogIdentity({ userId }: PostHogIdentityProps) {
  useEffect(() => {
    if (userId === undefined) {
      return;
    }

    const identifiedUserId = posthog.get_property("$user_id");

    if (identifiedUserId && identifiedUserId !== userId) {
      posthog.reset();
    }

    if (userId && identifiedUserId !== userId) {
      posthog.identify(userId);
    }
  }, [userId]);

  return null;
}
