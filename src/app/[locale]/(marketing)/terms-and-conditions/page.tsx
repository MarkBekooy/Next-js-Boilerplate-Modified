import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { generateSEOMetadata } from "@/utils/seo";
import { AppConfig } from "@/utils/app-config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("TermsOfService");

  return generateSEOMetadata({
    description: t("meta_description"),
    keywords: ["terms and conditions", "terms of service", AppConfig.name],
    locale,
    path: "/terms-and-conditions",
    title: t("meta_title"),
  });
}

export default async function TermsAndConditionsPage() {
  const t = await getTranslations("TermsOfService");

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 text-base leading-7 sm:text-lg">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mb-4 font-medium">{t("last_updated")}</p>
      <p>{t("introduction")}</p>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("acceptance_title")}</h2>
        <p>{t("acceptance_content")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("description_title")}</h2>
        <p>{t("description_content")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("user_accounts_title")}</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>{t("user_accounts_point1")}</li>
          <li>{t("user_accounts_point2")}</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("content_title")}</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>{t("content_point1")}</li>
          <li>{t("content_point2")}</li>
          <li>{t("content_point3")}</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("intellectual_property_title")}</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>{t("intellectual_property_point1")}</li>
          <li>{t("intellectual_property_point2")}</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("disclaimer_title")}</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>{t("disclaimer_point1")}</li>
          <li>{t("disclaimer_point2")}</li>
          <li>{t("disclaimer_point3")}</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("limitation_title")}</h2>
        <p>{t("limitation_content")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("termination_title")}</h2>
        <p>{t("termination_content")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("changes_title")}</h2>
        <p>{t("changes_content")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("governing_law_title")}</h2>
        <p>{t("governing_law_content")}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">{t("contact_title")}</h2>
        <p className="mb-2">{t("contact_content")}</p>
        <a className="underline underline-offset-4" href={`mailto:${t("contact_email")}`}>
          {t("contact_email")}
        </a>
      </section>
    </article>
  );
}
