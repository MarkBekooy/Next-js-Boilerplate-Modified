import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { withPostHogConfig } from "@posthog/nextjs-config";
import createNextIntlPlugin from "next-intl/plugin";
import "./src/libs/Env";

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
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

// Compose plugins on the config only when their feature is enabled.
// oxlint-disable-next-line import/no-mutable-exports -- Next config plugins are conditionally composed into this accumulator.
let configWithPlugins = createNextIntlPlugin("./src/libs/i18n/request.ts")(baseConfig);

if (process.env.ANALYZE === "true") {
  configWithPlugins = withBundleAnalyzer()(configWithPlugins);
}

// Upload source maps in production when PostHog credentials are configured.
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
