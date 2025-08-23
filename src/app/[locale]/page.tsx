import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata(props: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: "RootPage",
  });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function RootPage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: "RootPage",
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("hello_world")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is just some filler text</p>
        </CardContent>
      </Card>
      <ThemeToggle />
      <LocaleSwitcher />
    </>
  );
};
