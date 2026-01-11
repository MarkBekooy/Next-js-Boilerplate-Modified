import { ClerkProvider } from "@clerk/nextjs";

import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import ReactQueryProvider from "@/contexts/react-query-providers";
import { routing } from "@/libs/I18nRouting";
import { ThemeProvider } from "@/libs/ThemeProvider";
import { ClerkLocalizations } from "@/utils/AppConfig";
import { getI18nPath } from "@/utils/Helpers";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider
          appearance={{
            cssLayerName: "clerk", // Ensure Clerk is compatible with Tailwind CSS v4
          }}
          localization={clerkLocale}
          signInUrl={signInUrl}
          signUpUrl={signUpUrl}
          signInFallbackRedirectUrl={dashboardUrl}
          signUpFallbackRedirectUrl={dashboardUrl}
          afterSignOutUrl={afterSignOutUrl}
        >
          <NextIntlClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ReactQueryProvider>
                {props.children}
              </ReactQueryProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
