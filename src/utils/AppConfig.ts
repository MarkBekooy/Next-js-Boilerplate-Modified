import type { LocalizationResource } from "@clerk/types";
import type { LocalePrefixMode } from "next-intl/routing";
import { enUS, frFR } from "@clerk/localizations";

const localePrefix: LocalePrefixMode = "as-needed";

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: "Nextjs Starter",
  locales: [
    {
      id: "en",
      name: "English",
    },
    {
      id: "fr",
      name: "Français",
    },
  ],
  defaultLocale: "en",
  localePrefix,
};

export const AllLocales = AppConfig.locales.map(locale => locale.id);

const supportedLocales: Record<string, LocalizationResource> = {
  en: enUS,
  fr: frFR,
};

export const ClerkLocalizations = {
  defaultLocale: enUS,
  supportedLocales,
};
