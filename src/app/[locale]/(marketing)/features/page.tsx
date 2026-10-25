import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FeaturesPage");

  return { title: t("meta_title"), description: t("meta_description") };
}

export default function FeaturesPage() {
  return (
    <Suspense fallback={<FeaturesPageSkeleton />}>
      <FeaturesPageContent />
    </Suspense>
  );
}

async function FeaturesPageContent() {
  const t = await getTranslations("FeaturesPage");

  return <h1>{t("title")}</h1>;
}

function FeaturesPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded bg-gray-300 dark:bg-gray-700" />
      <div className="h-4 w-80 rounded bg-gray-300 dark:bg-gray-700" />
    </div>
  );
}
