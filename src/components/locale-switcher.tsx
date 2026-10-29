"use client";

import { Globe } from "lucide-react";
import { hasLocale, useLocale, useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useRouter } from "@/libs/i18n/navigation";
import { routing } from "@/libs/i18n/routing";
import { AppConfig } from "@/utils/app-config";

export function LocaleSwitcherSkeleton() {
  return <Skeleton aria-hidden className="h-9 w-35" />;
}

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navigation");

  function handleChange(value: string) {
    if (hasLocale(routing.locales, value)) {
      router.replace(pathname, { locale: value });
    }
  }

  return (
    <Select
      value={locale}
      items={AppConfig.locales.map((lang) => ({
        label: lang.name,
        value: lang.id,
      }))}
      onValueChange={(value) => {
        if (value) {
          handleChange(value);
        }
      }}
    >
      <SelectTrigger
        aria-label={t("language_switcher")}
        variant="ghost"
        className="w-35"
      >
        <div className="flex items-center gap-2">
          <Globe className="size-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {AppConfig.locales.map((lang) => (
          <SelectItem key={lang.id} value={lang.id}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
