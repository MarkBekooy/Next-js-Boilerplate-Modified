import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { HeaderAuthFallback } from "@/components/header-auth-fallback";
import { IntentPrefetchLink } from "@/components/intent-prefetch-link";
import { Logo } from "@/components/logo";
import { MobileNavigation } from "@/components/marketing/mobile-navigation";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  const t = useTranslations("Navigation");

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <IntentPrefetchLink href="/" className="text-2xl font-semibold">
            <Logo />
          </IntentPrefetchLink>

          <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
            <IntentPrefetchLink href="/features" className="hover:text-foreground">
              {t("features")}
            </IntentPrefetchLink>
            <IntentPrefetchLink href="/about" className="hover:text-foreground">
              {t("about")}
            </IntentPrefetchLink>
            <IntentPrefetchLink href="/blog" className="hover:text-foreground">
              {t("blog")}
            </IntentPrefetchLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Suspense fallback={<HeaderAuthFallback />}>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  {t("sign_in")}
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">{t("sign_up")}</Button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <UserButton />
            </Show>
          </Suspense>

          <MobileNavigation
            about={t("about")}
            blog={t("blog")}
            features={t("features")}
            navigation={t("navigation")}
            openNavigation={t("open_navigation")}
          />
        </div>
      </div>
    </header>
  );
}
