import { defineRouting } from "next-intl/routing";
import { AllLocales, AppConfig } from "@/utils/app-config";

export const routing = defineRouting({
  defaultLocale: AppConfig.defaultLocale,
  localeDetection: true,
  localePrefix: AppConfig.localePrefix,
  locales: AllLocales,
});
