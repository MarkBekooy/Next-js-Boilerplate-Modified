import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FeaturesPage");

  return { title: t("meta_title"), description: t("meta_description") };
}

export default function FeaturesPage() {
  const t = useTranslations("FeaturesPage");

  return <h1>{t("title")}</h1>;
}
