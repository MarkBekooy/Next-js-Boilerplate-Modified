import { PostHog } from "posthog-node";
import { Env } from "./Env";

let posthogInstance: PostHog | null = null;

export function getPostHogServer() {
  if (!posthogInstance) {
    posthogInstance = new PostHog(Env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: Env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogInstance;
}
