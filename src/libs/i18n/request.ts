import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { tryCatch } from "@/utils/try-catch";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale ?? (await rootParams.locale());

  if (!hasLocale(routing.locales, resolvedLocale)) {
    notFound();
  }

  const { data: localeModule, error: localeLoadError } = await tryCatch(
    import(`../../locales/${resolvedLocale}.json`),
  );

  if (localeLoadError) {
    throw new Error(`Failed to load messages for locale: ${resolvedLocale}`, {
      cause: localeLoadError,
    });
  }

  return {
    locale: resolvedLocale,
    messages: localeModule.default,
  };
});
