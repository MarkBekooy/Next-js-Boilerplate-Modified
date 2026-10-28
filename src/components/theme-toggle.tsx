"use client";

import { cn } from "cn";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { use } from "react";
import { browser } from "react-dom";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const themeToggleFrameClassName =
  "flex w-fit gap-0.5 overflow-hidden rounded-md border border-zinc-100 dark:border-zinc-800";

export function ThemeToggleSkeleton() {
  return (
    <div aria-hidden="true" className={themeToggleFrameClassName}>
      <Skeleton className="size-8" />
      <Skeleton className="size-8" />
      <Skeleton className="size-8" />
    </div>
  );
}

export function ThemeToggle() {
  use(
    browser(
      "The selected theme depends on browser storage and system preferences."
    )
  );
  const t = useTranslations("App");
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="items-center gap-2" aria-label={t("theme_selector")}>
      <div
        className={cn(
          themeToggleFrameClassName,
          "relative z-10 animate-in fade-in"
        )}
      >
        <Button
          variant={theme === "system" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setTheme("system")}
        >
          <Monitor className="size-4" />
          <span className="sr-only">{t("theme_system")}</span>
        </Button>
        <Button
          variant={theme === "light" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setTheme("light")}
        >
          <Sun className="size-4" />
          <span className="sr-only">{t("theme_light")}</span>
        </Button>
        <Button
          variant={theme === "dark" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setTheme("dark")}
        >
          <Moon className="size-4" />
          <span className="sr-only">{t("theme_dark")}</span>
        </Button>
      </div>
    </fieldset>
  );
}
