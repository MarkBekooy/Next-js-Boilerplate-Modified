import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { FooterLegalLinks } from "@/components/footer-legal-links";
import {
  LocaleSwitcher,
  LocaleSwitcherSkeleton,
} from "@/components/locale-switcher";
import { ThemeToggle, ThemeToggleSkeleton } from "@/components/theme-toggle";
import { AppConfig } from "@/utils/app-config";

// oxlint-disable-next-line require-await -- "use cache" requires an async function.
async function getCurrentYear() {
  "use cache";
  cacheLife("max");

  return new Date().getFullYear();
}

export async function Footer() {
  const year = await getCurrentYear();

  return (
    <footer className="border-t">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-col items-center gap-3 p-4 sm:py-2 lg:flex-row lg:justify-between">
        <div className="min-w-0 text-center text-sm text-muted-foreground lg:text-left">
          <span className="block sm:inline">
            &copy; {year} {AppConfig.name}
          </span>
          <span className="mx-2 hidden sm:inline">·</span>
          <span className="mt-1 block sm:mt-0 sm:inline">
            Made with ❤️ by{" "}
            <a
              href="https://www.frostbytesoftware.org/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-foreground underline-offset-4 hover:underline sm:font-medium"
            >
              FrostByte Software
            </a>
          </span>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <Suspense fallback={null}>
            <FooterLegalLinks />
          </Suspense>
          <div className="flex flex-wrap items-center justify-center gap-4 border-t pt-3 sm:border-t-0 sm:pt-0 lg:justify-start">
            <Suspense fallback={<LocaleSwitcherSkeleton />}>
              <LocaleSwitcher />
            </Suspense>
            <Suspense fallback={<ThemeToggleSkeleton />}>
              <ThemeToggle />
            </Suspense>
          </div>
        </div>
      </div>
    </footer>
  );
}
