import createMDX from "@next/mdx";
import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { Env } from "./src/libs/env";

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    agentUpgrade: "security",
    exposeTestingApiInProductionBuild: process.env.EXPOSE_TESTING_API === "1",
    globalNotFound: true,
    turbopackGc: true,
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
    remarkPlugins: [
      "remark-gfm",
      "remark-frontmatter",
      "remark-mdx-frontmatter",
    ],
  },
});

// oxlint-disable-next-line import/no-mutable-exports -- Next config plugins are conditionally composed into this accumulator.
let configWithPlugins = withMDX(baseConfig);

// Initialize the Next-Intl plugin
const withNextIntl = createNextIntlPlugin("./src/libs/i18n/request.ts");

configWithPlugins = withNextIntl(configWithPlugins);

// Conditionally configure PostHog in production when credentials are available.
if (
  Env.NODE_ENV === "production" &&
  Env.POSTHOG_API_KEY &&
  Env.POSTHOG_PROJECT_ID
) {
  configWithPlugins = withPostHogConfig(configWithPlugins, {
    personalApiKey: Env.POSTHOG_API_KEY,
    projectId: Env.POSTHOG_PROJECT_ID,
    host: Env.NEXT_PUBLIC_POSTHOG_HOST,
    sourcemaps: {
      enabled: true,
      deleteAfterUpload: true,
    },
  });
}

export default configWithPlugins;
