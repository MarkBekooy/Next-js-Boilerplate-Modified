import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";
import { withPostHogConfig } from "@posthog/nextjs-config";
import createNextIntlPlugin from "next-intl/plugin";
import "./src/libs/env";

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    exposeTestingApiInProductionBuild: process.env.EXPOSE_TESTING_API === "1",
    globalNotFound: true,
    useOffline: true,
  },
  logging: {
    browserToTerminal: false,
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  partialPrefetching: true,
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  reactCompiler: true,
  rewrites() {
    return Promise.resolve([
      {
        source: "/relay-FBSt/static/:path*", // FBSt = FrostByte Software template
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/relay-FBSt/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ]);
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

const withMDX = createMDX({
  extension: /\.(?:md|mdx)$/u,
  options: {
    remarkPlugins: ["remark-gfm", "remark-frontmatter", "remark-mdx-frontmatter"],
  },
});

// oxlint-disable-next-line import/no-mutable-exports -- Next config plugins are conditionally composed into this accumulator.
let configWithPlugins = withMDX(baseConfig);

// Initialize the Next-Intl plugin
const withNextIntl = createNextIntlPlugin("./src/libs/i18n/request.ts");

configWithPlugins = withNextIntl(configWithPlugins);

// Conditionally enable bundle analysis
if (process.env.ANALYZE === "true") {
  configWithPlugins = withBundleAnalyzer()(configWithPlugins);
}

// Conditionally configure PostHog in production when credentials are available.
if (
  process.env.NODE_ENV === "production" &&
  process.env.POSTHOG_API_KEY &&
  process.env.POSTHOG_PROJECT_ID
) {
  configWithPlugins = withPostHogConfig(configWithPlugins, {
    personalApiKey: process.env.POSTHOG_API_KEY,
    projectId: process.env.POSTHOG_PROJECT_ID,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    sourcemaps: {
      enabled: true,
      deleteAfterUpload: true,
    },
  });
}

export default configWithPlugins;
