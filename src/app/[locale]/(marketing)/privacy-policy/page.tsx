import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { generateSEOMetadata } from "@/utils/seo";
import { AppConfig } from "@/utils/app-config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("PrivacyPolicy");

  return generateSEOMetadata({
    description: t("meta_description"),
    keywords: ["privacy policy", "data privacy", AppConfig.name],
    locale,
    path: "/privacy-policy",
    title: t("meta_title"),
  });
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("PrivacyPolicy");

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl px-4 py-12 text-base leading-7 sm:text-lg"
    >
      <h1 className="mb-8 text-4xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mb-8 font-medium">{t("effective_date")}</p>

      <section>
        <h2 className="mb-4 text-2xl font-bold">{t("introduction_title")}</h2>
        <p>{t("introduction_content")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("information_title")}</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>{t("user_provided_data")}</li>
          <li>{t("account_information")}</li>
          <li>{t("usage_data")}</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("usage_title")}</h2>
        <p className="mb-2">{t("usage_content")}</p>
        <ul className="ml-6 list-disc space-y-2">
          <li>{t("usage_point1")}</li>
          <li>{t("usage_point2")}</li>
          <li>{t("usage_point3")}</li>
          <li>{t("usage_point4")}</li>
          <li>{t("usage_point5")}</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("sharing_title")}</h2>
        <p className="mb-2">{t("sharing_content")}</p>
        <ul className="ml-6 list-disc space-y-2">
          <li>{t("sharing_point1")}</li>
          <li>{t("sharing_point2")}</li>
          <li>{t("sharing_point3")}</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("security_title")}</h2>
        <p>{t("security_content")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("retention_title")}</h2>
        <p>{t("retention_content")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("rights_title")}</h2>
        <p className="mb-2">{t("rights_content")}</p>
        <ul className="ml-6 list-disc space-y-2">
          <li>{t("rights_point1")}</li>
          <li>{t("rights_point2")}</li>
          <li>{t("rights_point3")}</li>
        </ul>
        <p className="mt-4">{t("rights_contact")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("changes_title")}</h2>
        <p>{t("changes_content")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("contact_title")}</h2>
        <p className="mb-2">{t("contact_content")}</p>
        <a className="underline underline-offset-4" href={`mailto:${t("contact_email")}`}>
          {t("contact_email")}
        </a>
      </section>
    </main>
  );
}
