import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { AppConfig } from "@/utils/app-config";
import { getBaseUrl } from "@/utils/helpers";

type ArticleFrontmatter = {
  author?: string;
  description: string;
  keywords?: string[];
  metadata_image?: string;
  published_at: string;
  title: string;
  updated_at?: string;
  url_path: string;
};

// oxlint-disable-next-line react-doctor/only-export-components -- Next.js route metadata must be exported from the MDX page.
export function createArticleMetadata(article: ArticleFrontmatter): Metadata {
  const url = new URL(article.url_path, getBaseUrl()).toString();

  const image = article.metadata_image
    ? new URL(article.metadata_image, getBaseUrl()).toString()
    : undefined;

  return {
    alternates: { canonical: url },
    title: article.title,
    description: article.description,
    authors: article.author ? [{ name: article.author }] : undefined,
    keywords: article.keywords,
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.description,
      authors: article.author ? [article.author] : undefined,
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      tags: article.keywords,
      images: image ? [{ url: image, alt: article.title }] : undefined,
    },
    twitter: image
      ? {
          card: "summary_large_image",
          title: article.title,
          description: article.description,
          images: [image],
        }
      : undefined,
  };
}

// oxlint-disable-next-line react-doctor/only-export-components -- Keep serialization beside the article component and test its escaping.
export function createArticleJsonLd(article: ArticleFrontmatter): string {
  const url = new URL(article.url_path, getBaseUrl()).toString();

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    author: article.author ? { "@type": "Person", name: article.author } : undefined,
    dateModified: article.updated_at || article.published_at,
    datePublished: article.published_at,
    description: article.description,
    headline: article.title,
    image: article.metadata_image
      ? new URL(article.metadata_image, getBaseUrl()).toString()
      : undefined,
    keywords: article.keywords,
    mainEntityOfPage: { "@id": url, "@type": "WebPage" },
    publisher: { "@type": "Organization", name: AppConfig.name },
    url,
  }).replaceAll("<", "\\u003c");
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export async function ArticleDetails({ article }: { article: ArticleFrontmatter }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Blog")]);

  return (
    <>
      <script
        // oxlint-disable-next-line react/no-danger -- JSON-LD requires a script; serialization escapes HTML tags.
        dangerouslySetInnerHTML={{ __html: createArticleJsonLd(article) }}
        id="article-schema"
        type="application/ld+json"
      />
      <section
        aria-label={t("article_details")}
        className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-muted-foreground"
      >
        {article.author ? <span>{t("by", { author: article.author })}</span> : null}
        <time dateTime={article.published_at}>
          {t("published", { date: formatDate(article.published_at, locale) })}
        </time>
        {article.updated_at ? (
          <time dateTime={article.updated_at}>
            {t("updated", { date: formatDate(article.updated_at, locale) })}
          </time>
        ) : null}
        {article.keywords?.length ? (
          <ul aria-label={t("keywords")} className="flex flex-wrap gap-2">
            {article.keywords.map((keyword) => (
              <li key={keyword} className="list-none">
                <Badge variant="outline">{keyword}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  );
}
