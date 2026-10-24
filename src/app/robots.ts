import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/utils/helpers";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/dashboard",
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
