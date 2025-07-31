"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Based on https://www.npmjs.com/package/next-themes#avoid-hydration-mismatch
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="items-center gap-2" aria-label="Theme selector" role="group">
      <div
        className="relative z-10 flex w-fit animate-in overflow-hidden rounded-md border border-zinc-100 fade-in dark:border-zinc-800"
        style={{ gap: "2px" }}
      >
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${theme === "system" ? "bg-muted" : ""}`}
          onClick={() => setTheme("system")}
        >
          <Monitor className="h-4 w-4" />
          <span className="sr-only">System theme</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${theme === "light" ? "bg-muted" : ""}`}
          onClick={() => setTheme("light")}
        >
          <Sun className="h-4 w-4" />
          <span className="sr-only">Light theme</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${theme === "dark" ? "bg-muted" : ""}`}
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" />
          <span className="sr-only">Dark theme</span>
        </Button>
      </div>
    </div>
  );
}
