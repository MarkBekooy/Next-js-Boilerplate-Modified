import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { HeaderAuthFallback } from "@/components/header-auth-fallback";
import { IntentPrefetchLink } from "@/components/intent-prefetch-link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function Header() {
  const t = useTranslations("Navigation");

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <IntentPrefetchLink href="/" className="text-2xl font-semibold">
          <Logo />
        </IntentPrefetchLink>

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
        </div>
      </div>
    </header>
  );
}
