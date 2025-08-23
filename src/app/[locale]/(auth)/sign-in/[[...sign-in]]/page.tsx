import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getI18nPath } from "@/utils/Helpers";

export async function generateMetadata(props: PageProps<"/[locale]/sign-in/[[...sign-in]]">): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: "SignIn",
  });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function SignInPage(props: PageProps<"/[locale]/sign-in/[[...sign-in]]">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <SignIn path={getI18nPath("/sign-in", locale)} />
  );
};
