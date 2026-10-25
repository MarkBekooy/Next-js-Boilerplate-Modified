"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const themeToggleFrameClassName =
  "flex w-fit gap-0.5 overflow-hidden rounded-md border border-zinc-100 dark:border-zinc-800";

const mountedThemeToggleFrameClassName = `relative z-10 animate-in ${themeToggleFrameClassName} fade-in`;

function subscribeToMount(_onStoreChange: () => void) {
  return () => {
    // Mount snapshot never changes.
  };
}

function getMountedSnapshot() {
  return true;
}

function getServerMountedSnapshot() {
  return false;
}

function ThemeToggleSkeleton() {
  return (
    <div aria-hidden="true" className={themeToggleFrameClassName}>
      <div className="size-8 animate-pulse rounded-none bg-muted" />
      <div className="size-8 animate-pulse rounded-none bg-muted" />
      <div className="size-8 animate-pulse rounded-none bg-muted" />
    </div>
  );
}

export function ThemeToggle() {
  const t = useTranslations("App");
  const { theme, setTheme } = useTheme();

  const mounted = useSyncExternalStore(
    subscribeToMount,
    getMountedSnapshot,
    getServerMountedSnapshot,
  );

  if (!mounted) {
    return <ThemeToggleSkeleton />;
  }

  return (
    <fieldset className="items-center gap-2" aria-label={t("theme_selector")}>
      <div className={mountedThemeToggleFrameClassName}>
        <Button
          variant="ghost"
          size="icon"
          className={`size-8 ${theme === "system" ? "bg-muted" : ""}`}
          onClick={() => setTheme("system")}
        >
          <Monitor className="size-4" />
          <span className="sr-only">{t("theme_system")}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`size-8 ${theme === "light" ? "bg-muted" : ""}`}
          onClick={() => setTheme("light")}
        >
          <Sun className="size-4" />
          <span className="sr-only">{t("theme_light")}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`size-8 ${theme === "dark" ? "bg-muted" : ""}`}
          onClick={() => setTheme("dark")}
        >
          <Moon className="size-4" />
          <span className="sr-only">{t("theme_dark")}</span>
        </Button>
      </div>
    </fieldset>
  );
}
