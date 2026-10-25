import { getTranslations, getLocale } from "next-intl/server";
import { getBaseUrl } from "@/utils/helpers";
import { getPathname } from "@/libs/i18n/navigation";

export async function JsonLd() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("JsonLd")]);
  const url = `${getBaseUrl()}${getPathname({ locale, href: "/" })}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    applicationCategory: "LifestyleApplication",
    applicationSubCategory: t("application_subcategory"),
    creator: {
      "@type": "Person",
      name: "Mark Bekooy",
    },
    description: t("description"),
    inLanguage: locale,
    name: "MyTasteRank",
    operatingSystem: "Web",
    url,
  };

  return (
    <script
      type="application/ld+json"
      // oxlint-disable-next-line react/no-danger -- Required to render JSON-LD as a script.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c"),
      }}
    />
  );
}
