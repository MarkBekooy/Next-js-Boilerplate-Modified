"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/libs/i18n/navigation";

export function FooterLegalLinks() {
  const pathname = usePathname();
  const t = useTranslations("MarketingFooter");

  if (pathname !== "/") {
    return null;
  }

  return (
    <nav
      className="flex flex-wrap justify-center gap-3 text-xs sm:justify-start"
      aria-label={t("legal_navigation_label")}
    >
      <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-foreground">
        {t("privacy_policy_link")}
      </Link>
      <Link
        href="/terms-and-conditions"
        className="underline underline-offset-4 hover:text-foreground"
      >
        {t("terms_and_conditions_link")}
      </Link>
    </nav>
  );
}
