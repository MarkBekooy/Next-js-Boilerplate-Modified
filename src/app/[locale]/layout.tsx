import { ClerkProvider } from "@clerk/nextjs";
import { locale as getRootLocale } from "next/root-params";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { getMessages } from "next-intl/server";
import { OfflineIndicator } from "@/components/offline-indicator";
import ReactQueryProvider from "@/providers/react-query-providers";
import { routing } from "@/libs/i18n/routing";
import { ThemeProvider } from "@/providers/theme-provider";
import { ClerkLocalizations } from "@/utils/app-config";
import { getI18nPath } from "@/utils/helpers";
import { Toaster } from "@/components/ui/sonner";
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
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: LayoutProps<"/[locale]">) {
  const requestedLocale = await getRootLocale();

  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  const messages = await getMessages({ locale });

  // SAFETY: `hasLocale` confirms this key exists in the Clerk localization map for the configured locales.
  const clerkLocale =
    ClerkLocalizations.supportedLocales[
      locale as keyof typeof ClerkLocalizations.supportedLocales
    ] ?? ClerkLocalizations.defaultLocale;

  let signInUrl = "/sign-in";
  let signUpUrl = "/sign-up";
  let homeUrl = "/";

  if (locale !== routing.defaultLocale) {
    signInUrl = getI18nPath(signInUrl, locale);
    signUpUrl = getI18nPath(signUpUrl, locale);
    homeUrl = getI18nPath(homeUrl, locale);
  }

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <head>{/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" /> */}</head>
      {/* <ReactScan /> */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider
          appearance={{
            cssLayerName: "clerk", // Ensure Clerk is compatible with Tailwind CSS v4
            options: {
              showOptionalFields: true,
            },
          }}
          localization={clerkLocale}
          signInUrl={signInUrl}
          signUpUrl={signUpUrl}
          signInFallbackRedirectUrl={homeUrl}
          signUpFallbackRedirectUrl={homeUrl}
          afterSignOutUrl={homeUrl}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ReactQueryProvider>
                <OfflineIndicator />
                {props.children}
              </ReactQueryProvider>
              <Toaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
