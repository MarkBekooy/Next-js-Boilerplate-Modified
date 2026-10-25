import type { MetadataRoute } from "next";
import { AppConfig } from "@/utils/app-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#ba1c0f",
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/android-chrome-192x192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/android-chrome-512x512.png",
        type: "image/png",
      },
    ],
    name: AppConfig.name,
    short_name: AppConfig.name,
    start_url: "/",
    theme_color: "#ffffff",
  };
}
