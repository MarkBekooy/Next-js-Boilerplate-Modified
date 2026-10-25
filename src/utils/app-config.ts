import type { LocalizationResource } from "@clerk/nextjs/types";
import type { LocalePrefixMode } from "next-intl/routing";
import { enUS, nlNL } from "@clerk/localizations";

const localePrefix: LocalePrefixMode = "as-needed";

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: "Nextjs Starter",
  locales: [
    {
      id: "en",
      name: "English",
      posixLocale: "en_US",
    },
    {
      id: "nl",
      name: "Nederlands",
      posixLocale: "nl_NL",
    },
  ],
  defaultLocale: "en",
  localePrefix,
} as const;

export const AllLocales = AppConfig.locales.map((locale) => locale.id);

export const supportedLocales = {
  en: enUS,
  nl: nlNL,
} satisfies Record<(typeof AppConfig.locales)[number]["id"], LocalizationResource>;
