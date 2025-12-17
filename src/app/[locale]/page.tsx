import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import ActionPanel from "@/components/ActionPanel";
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

      <Card className="mx-auto my-3 max-w-3xl">
        <CardHeader className="flex flex-col items-center text-center">
          <CardTitle className="text-2xl font-bold">Action Panel</CardTitle>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              Tap a button below to see a message returned directly from the server.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ActionPanel />
          <div className="flex justify-center">
            <Link
              href="/test"
              className="rounded-xl border border-zinc-900/10 px-6 py-3 text-sm font-medium text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:border-zinc-100/10 dark:text-white"
            >
              Visit the test page
            </Link>
          </div>
        </CardContent>
      </Card>

      <ThemeToggle />
      <LocaleSwitcher />
    </>
  );
};
