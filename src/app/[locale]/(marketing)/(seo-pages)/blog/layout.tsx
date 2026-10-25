import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { AppConfig } from "@/utils/app-config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return locale === AppConfig.defaultLocale ? {} : { robots: { index: false, follow: true } };
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
