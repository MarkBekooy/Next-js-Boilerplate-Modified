import type { Metadata } from "next";
import { AppConfig, AllLocales } from "@/utils/app-config";
import { getBaseUrl } from "@/utils/helpers";
import { getPathname } from "@/libs/i18n/navigation";

type SEOConfig = {
  description: string;
  keywords: string[];
  locale: (typeof AppConfig.locales)[number]["id"];
  path?: string;
  title: string;
};

export function generateSEOMetadata({
  description,
  keywords,
  locale,
  path = "/",
  title,
}: SEOConfig): Metadata {
  const baseUrl = getBaseUrl();
  const localizedPath = getPathname({ locale, href: path });
  const canonical = new URL(localizedPath, baseUrl).toString();

  const openGraphLocale = AppConfig.locales.find(
    (appLocale) => appLocale.id === locale,
  )?.posixLocale;

  return {
    alternates: {
      canonical,
      languages: getLanguageAlternates(baseUrl, path),
    },
    description,
    keywords,
    metadataBase: new URL(baseUrl),
    openGraph: {
      description,
      locale: openGraphLocale ?? locale,
      siteName: AppConfig.name,
      title,
      type: "website",
      url: canonical,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      title,
    },
  };
}

function getLanguageAlternates(baseUrl: string, path: string) {
  return Object.fromEntries([
    ...AllLocales.map((locale) => [
      locale,
      new URL(getPathname({ locale, href: path }), baseUrl).toString(),
    ]),
    [
      "x-default",
      new URL(getPathname({ locale: AppConfig.defaultLocale, href: path }), baseUrl).toString(),
    ],
  ]);
}
