import { PostHog } from "posthog-node";
import { z } from "zod";

import { tryCatch } from "@/utils/try-catch";

import { Env } from "./env";
import "server-only";

let posthogInstance: PostHog | null = null;

const posthogCookieSchema = z.object({ distinct_id: z.string().min(1) });

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

export function getPostHogDistinctId(
  cookieHeader: string | string[] | undefined
) {
  const cookiePrefix = `ph_${Env.NEXT_PUBLIC_POSTHOG_KEY}_posthog=`;

  const cookieString = Array.isArray(cookieHeader)
    ? cookieHeader.join("; ")
    : cookieHeader;

  const cookieValue = cookieString
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(cookiePrefix))
    ?.slice(cookiePrefix.length);

  if (!cookieValue) {
    return;
  }

  const { data: parsedCookie, error: cookieParseError } = tryCatch(() =>
    posthogCookieSchema.safeParse(JSON.parse(decodeURIComponent(cookieValue)))
  );

  if (cookieParseError || !parsedCookie.success) {
    return;
  }

  return parsedCookie.data.distinct_id;
}
