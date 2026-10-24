import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { getLocale, getTranslations } from "next-intl/server";
import { AuthFormSkeleton } from "@/components/loaders/auth-form-skeleton";
import { getPathname } from "@/libs/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SignUp");

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function SignUpPage() {
  const locale = await getLocale();

  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <SignUp path={getPathname({ locale, href: "/sign-up" })} />
    </Suspense>
  );
}
