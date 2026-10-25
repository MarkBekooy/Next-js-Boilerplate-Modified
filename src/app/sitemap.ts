import type { MetadataRoute } from "next";
import { allSeoContentPages } from "@/constants/seo-content-pages";
import { getBaseUrl } from "@/utils/helpers";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/blog", baseUrl).toString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...allSeoContentPages.map((page) => ({
      url: new URL(page.urlPath, baseUrl).toString(),
      lastModified: page.updatedAt || page.publishedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
