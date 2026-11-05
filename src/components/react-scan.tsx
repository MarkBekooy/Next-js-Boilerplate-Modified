"use client";

// oxlint-disable-next-line ts/consistent-type-imports
import { JSX, useEffect } from "react";
// react-scan must be imported before react
import { scan } from "react-scan";

export function ReactScan(): JSX.Element | null {
  useEffect(() => {
    scan({
      enabled: true,
    });
  }, []);

  return null;
}
