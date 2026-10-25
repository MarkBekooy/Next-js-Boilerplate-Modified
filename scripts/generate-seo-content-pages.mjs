import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import parseFrontmatter from "front-matter";

const scriptDirectory = import.meta.dirname;
const projectDirectory = path.resolve(scriptDirectory, "..");
const contentDirectory = path.join(projectDirectory, "src/app/[locale]/(marketing)/(seo-pages)");
const outputPath = path.join(projectDirectory, "src/constants/seo-content-pages.ts");
const contentTypes = new Set(["blog", "compare", "guides", "solutions"]);

async function findMdxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findMdxFiles(entryPath);
      }

      return entry.name === "page.mdx" ? [entryPath] : [];
    }),
  );

  return files.flat();
}

function getRequiredString(attributes, field, filePath) {
  const value = attributes[field];

  if (!isString(value) || value.length === 0) {
    throw new Error(`Missing ${field} frontmatter: ${filePath}`);
  }

  return value;
}

async function getContentPages() {
  const files = await findMdxFiles(contentDirectory);

  const pages = await Promise.all(
    files.map(async (filePath) => {
      const relativePath = path.relative(contentDirectory, filePath);
      const segments = relativePath.split(path.sep);
      const [contentType, slug, fileName] = segments;

      if (!contentType || !slug || fileName !== "page.mdx" || !contentTypes.has(contentType)) {
        return null;
      }

      const content = await readFile(filePath, "utf-8");
      const { attributes } = parseFrontmatter(content);
      const urlPath = getRequiredString(attributes, "url_path", filePath);
      const expectedPath = `/${contentType}/${slug}`;

      if (urlPath !== expectedPath) {
        throw new Error(`url_path must be ${expectedPath}: ${filePath}`);
      }

      return {
        contentType,
        description: getRequiredString(attributes, "description", filePath),
        publishedAt: getRequiredString(attributes, "published_at", filePath),
        title: getRequiredString(attributes, "title", filePath),
        updatedAt: isString(attributes.updated_at) ? attributes.updated_at : "",
        urlPath,
      };
    }),
  );

  return pages
    .filter((page) => page !== null)
    .toSorted((left, right) => left.urlPath.localeCompare(right.urlPath));
}

function isString(value) {
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Frontmatter values are untyped at this file boundary.
  return typeof value === "string";
}

function formatField(field, value) {
  const line = `    ${field}: ${JSON.stringify(value)},`;

  if (line.length <= 100) {
    return [line];
  }

  return [`    ${field}:`, `      ${JSON.stringify(value)},`];
}

function formatPages(name, pages) {
  const lines = pages.flatMap((page) => [
    "  {",
    ...formatField("contentType", page.contentType),
    ...formatField("description", page.description),
    ...formatField("publishedAt", page.publishedAt),
    ...formatField("title", page.title),
    ...formatField("updatedAt", page.updatedAt),
    ...formatField("urlPath", page.urlPath),
    "  },",
  ]);

  return `export const ${name}: SeoContentPage[] = [\n${lines.join("\n")}\n];`;
}

const pages = await getContentPages();
const blogPages = pages.filter((page) => page.contentType === "blog");

const output = [
  "// Generated from MDX frontmatter by scripts/generate-seo-content-pages.mjs.",
  "// Do not edit manually.",
  "",
  'type SeoContentType = "blog" | "compare" | "guides" | "solutions";',
  "",
  "export type SeoContentPage = {",
  "  contentType: SeoContentType;",
  "  description: string;",
  "  publishedAt: string;",
  "  title: string;",
  "  updatedAt: string;",
  "  urlPath: string;",
  "};",
  "",
  formatPages("allSeoContentPages", pages),
  "",
  formatPages("blogContentPages", blogPages),
  "",
].join("\n");

await writeFile(outputPath, output);
