import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getI18nPath } from "@/utils/Helpers";

export async function generateMetadata(props: PageProps<"/[locale]/sign-up/[[...sign-up]]">): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: "SignUp",
  });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function SignUpPage(props: PageProps<"/[locale]/sign-up/[[...sign-up]]">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <SignUp path={getI18nPath("/sign-up", locale)} />
  );
};
