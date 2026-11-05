"use client";

import { useTranslations } from "next-intl";
import { useOffline } from "next/offline";
import { useEffect } from "react";
import { toast } from "sonner";

const offlineToastId = "offline-status";

export function OfflineIndicator() {
  const isOffline = useOffline();
  const t = useTranslations("OfflineIndicator");

  useEffect(() => {
    if (isOffline) {
      toast.error(t("title"), {
        description: t("description"),
        duration: Number.POSITIVE_INFINITY,
        id: offlineToastId,
      });
    } else {
      toast.dismiss(offlineToastId);
    }
  }, [isOffline, t]);

  return null;
}
