"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { IntentPrefetchLink } from "@/components/intent-prefetch-link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type MobileNavigationProps = {
  about: string;
  blog: string;
  features: string;
  navigation: string;
  openNavigation: string;
};

export function MobileNavigation({
  about,
  blog,
  features,
  navigation,
  openNavigation,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" className="md:hidden" aria-label={openNavigation} />
        }
      >
        <MenuIcon aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="sr-only">{navigation}</SheetTitle>
          <IntentPrefetchLink
            href="/"
            className="text-2xl font-semibold"
            onClick={() => setIsOpen(false)}
          >
            <Logo />
          </IntentPrefetchLink>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4" aria-label={navigation}>
          <IntentPrefetchLink
            href="/features"
            className="rounded-md px-3 py-2 text-xl font-medium hover:bg-muted"
            onClick={() => setIsOpen(false)}
          >
            {features}
          </IntentPrefetchLink>
          <IntentPrefetchLink
            href="/about"
            className="rounded-md px-3 py-2 text-xl font-medium hover:bg-muted"
            onClick={() => setIsOpen(false)}
          >
            {about}
          </IntentPrefetchLink>
          <IntentPrefetchLink
            href="/blog"
            className="rounded-md px-3 py-2 text-xl font-medium hover:bg-muted"
            onClick={() => setIsOpen(false)}
          >
            {blog}
          </IntentPrefetchLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
