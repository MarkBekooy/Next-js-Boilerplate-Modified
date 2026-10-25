import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-3xl px-4 py-12">{children}</main>;
}
