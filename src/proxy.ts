import type { NextFetchEvent, NextRequest } from "next/server";
import { detectBot, slidingWindow } from "@arcjet/next";
import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import arcjet from "@/libs/arcjet";
import { routing } from "./libs/i18n/routing";

const handleI18nRouting = createMiddleware(routing);
const handleClerk = clerkMiddleware((_auth, request) => handleI18nRouting(request));

// Improve security with Arcjet
const aj = arcjet
  .withRule(
    slidingWindow({
      mode: "LIVE",
      interval: 60,
      max: 100,
    }),
  )
  .withRule(
    detectBot({
      mode: "LIVE",
      // Block all bots except the following
      allow: [
        // See https://docs.arcjet.com/bot-protection/identifying-bots
        "CATEGORY:SEARCH_ENGINE", // Allow search engines
        "CATEGORY:PREVIEW", // Allow preview links to show OG images
        "CATEGORY:MONITOR", // Allow uptime monitoring services
        "CATEGORY:AI", // Allow AI and LLM crawlers
      ],
    }),
  );

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (pathname === "/relay-FBSt" || pathname.startsWith("/relay-FBSt/")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete("cookie");
    requestHeaders.delete("authorization");

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Verify the request with Arcjet
  if (process.env.ARCJET_KEY && !pathname.includes("/api/webhooks/")) {
    const decision = await aj.protect(request);

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    if (
      decision.isDenied() ||
      decision.results.some(({ reason }) => reason.isBot() && reason.isSpoofed())
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return handleClerk(request, event);
}

export const config = {
  matcher: [
    "/relay-FBSt/:path*",
    "/((?!_next|_vercel|relay-FBSt|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)",
    "/(api|trpc)(.*)",
    "/:locale/api/:path*",
    "/__clerk/(.*)",
  ],
};
