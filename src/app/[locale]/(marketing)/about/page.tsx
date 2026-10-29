import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AboutPage");

  return { title: t("meta_title"), description: t("meta_description") };
}

export default function AboutPage() {
  const t = useTranslations("AboutPage");

  return <h1>{t("title")}</h1>;
}
