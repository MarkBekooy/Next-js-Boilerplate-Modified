"use client";

// react-scan must be imported before react
import { scan } from "react-scan";
// oxlint-disable-next-line ts/consistent-type-imports
import { JSX, useEffect } from "react";

export function ReactScan(): JSX.Element | null {
  useEffect(() => {
    scan({
      enabled: true,
    });
  }, []);

  return null;
}
