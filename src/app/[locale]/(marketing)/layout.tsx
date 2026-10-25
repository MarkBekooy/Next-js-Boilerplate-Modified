import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 pt-6 pb-12 md:pt-8 md:pb-20">
      {children}
    </main>
  );
}
