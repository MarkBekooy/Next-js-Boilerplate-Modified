"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "@/libs/i18n/navigation";
import { AppConfig } from "@/utils/AppConfig";

export const LocaleSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (value: string) => {
    router.push(`/${value}${pathname}`);
    router.refresh();
  };

  return (
    <Select defaultValue={locale} onValueChange={handleChange} aria-label="lang-switcher">
      <SelectTrigger className="w-35">
        <div className="flex items-center gap-2">
          <Globe className="size-4" />
          <SelectValue placeholder="Select language" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {AppConfig.locales.map(lang => (
          <SelectItem key={lang.id} value={lang.id}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
