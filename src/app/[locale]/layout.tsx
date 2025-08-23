import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { routing } from "@/libs/I18nRouting";
import { ThemeProvider } from "@/libs/ThemeProvider";
import { ClerkLocalizations } from "@/utils/AppConfig";
import { getI18nPath } from "@/utils/Helpers";
import ReactQueryProvider from "./react-query-providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  icons: [
    {
      rel: "apple-touch-icon",
      url: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon-16x16.png",
    },
    {
      rel: "icon",
      url: "/favicon.ico",
    },
  ],
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout(props: LayoutProps<"/[locale]">) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const clerkLocale = ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;
  let signInUrl = "/sign-in";
  let signUpUrl = "/sign-up";
  let dashboardUrl = "/dashboard";
  let afterSignOutUrl = "/";

  if (locale !== routing.defaultLocale) {
    signInUrl = getI18nPath(signInUrl, locale);
    signUpUrl = getI18nPath(signUpUrl, locale);
    dashboardUrl = getI18nPath(dashboardUrl, locale);
    afterSignOutUrl = getI18nPath(afterSignOutUrl, locale);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ClerkProvider
          localization={clerkLocale}
          signInUrl={signInUrl}
          signUpUrl={signUpUrl}
          signInFallbackRedirectUrl={dashboardUrl}
          signUpFallbackRedirectUrl={dashboardUrl}
          afterSignOutUrl={afterSignOutUrl}
          appearance={{
            cssLayerName: "clerk", // Ensure Clerk is compatible with Tailwind CSS v4
          }}
        >
          <NextIntlClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <PostHogProvider>
                <ReactQueryProvider>
                  {props.children}
                </ReactQueryProvider>
              </PostHogProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
