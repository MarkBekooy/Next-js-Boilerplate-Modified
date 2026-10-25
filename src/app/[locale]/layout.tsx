import { ClerkProvider } from "@clerk/nextjs";
import { supportedLocales } from "@/utils/app-config";
import { NextIntlClientProvider } from "next-intl";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { getLocale } from "next-intl/server";
import { OfflineIndicator } from "@/components/offline-indicator";
import ReactQueryProvider from "@/providers/react-query-providers";
import { getPathname } from "@/libs/i18n/navigation";
import { routing } from "@/libs/i18n/routing";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
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
  const locale = await getLocale();
  const clerkLocale = supportedLocales[locale];
  const signInUrl = getPathname({ locale, href: "/sign-in" });
  const signUpUrl = getPathname({ locale, href: "/sign-up" });
  const homeUrl = getPathname({ locale, href: "/" });

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <head>{/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" /> */}</head>
      {/* <ReactScan /> */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <JsonLd />
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
          <NextIntlClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ReactQueryProvider>
                <OfflineIndicator />
                {props.children}
                <Footer />
              </ReactQueryProvider>
              <Toaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
