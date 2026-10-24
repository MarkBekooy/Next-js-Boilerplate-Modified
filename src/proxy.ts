import type { NextFetchEvent, NextRequest } from "next/server";
import { detectBot, slidingWindow } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import arcjet from "@/libs/Arcjet";
import { routing } from "./libs/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/:locale/dashboard(.*)"]);

const isAuthPage = createRouteMatcher([
  "/sign-in(.*)",
  "/:locale/sign-in(.*)",
  "/sign-up(.*)",
  "/:locale/sign-up(.*)",
]);

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
  // Verify the request with Arcjet
  if (process.env.ARCJET_KEY && !request.nextUrl.pathname.includes("/api/webhooks/")) {
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

  // Clerk keyless mode doesn't work with i18n, this is why we need to run the middleware conditionally
  if (isAuthPage(request) || isProtectedRoute(request)) {
    return clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const locale = req.nextUrl.pathname.slice(0, req.nextUrl.pathname.indexOf("/dashboard"));

        const signInUrl = new URL(`${locale}/sign-in`, req.url);

        await auth.protect({
          unauthenticatedUrl: signInUrl.toString(),
        });
      }

      return handleI18nRouting(req);
    })(request, event);
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - … PostHog relay route
  matcher: "/((?!_next|_vercel|relay-FBSt|.*\\..*).*)",
};
