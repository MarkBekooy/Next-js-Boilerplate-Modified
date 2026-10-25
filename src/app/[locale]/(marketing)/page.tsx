import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/libs/i18n/navigation";
import ActionPanel from "@/components/action-panel";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RootPage");

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default function RootPage() {
  return (
    <Suspense fallback={<RootPageSkeleton />}>
      <RootPageContent />
    </Suspense>
  );
}

async function RootPageContent() {
  const t = await getTranslations("RootPage");

  // Track feature flags in PostHog
  // const posthog = getPostHogServer();
  // const flags = await posthog.getAllFlags(
  //   "user_distinct_id", // replace with a user's distinct ID
  // );
  // await posthog.shutdown();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is just some filler text</p>
        </CardContent>
      </Card>

      <Card className="mx-auto my-3 max-w-3xl">
        <CardHeader className="flex flex-col items-center text-center">
          <CardTitle className="text-2xl font-bold">Action Panel</CardTitle>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              Tap a button below to see a message returned directly from the server.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ActionPanel />
          <div className="flex justify-center">
            {/* Feature flag tracking disabled for now, but this is an example */}
            {/* {flags["test-page-flag"]
              && (
                <Link
                  href="/test"
                  className="rounded-xl border border-zinc-900/10 px-6 py-3 text-sm font-medium text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:border-zinc-100/10 dark:text-white"
                >
                  Visit the test page
                </Link>
              )} */}
            <Link
              href="/test"
              className={cn(buttonVariants({ variant: "outline" }), "mt-2 p-5 text-sm font-medium")}
            >
              Visit the test page
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function RootPageSkeleton() {
  return (
    <>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-64 max-w-full" />
        </CardContent>
      </Card>

      <Card className="mx-auto my-3 max-w-3xl">
        <CardHeader className="items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mx-auto h-10 w-36" />
        </CardContent>
      </Card>
    </>
  );
}
