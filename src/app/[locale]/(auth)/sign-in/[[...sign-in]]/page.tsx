import type { Metadata } from "next";
import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { getLocale, getTranslations } from "next-intl/server";
import { AuthFormSkeleton } from "@/components/loaders/auth-form-skeleton";
import { getPathname } from "@/libs/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SignIn");

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function SignInPage() {
  const locale = await getLocale();

  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <SignIn path={getPathname({ locale, href: "/sign-in" })} />
    </Suspense>
  );
}
