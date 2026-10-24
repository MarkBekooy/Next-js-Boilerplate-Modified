import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { withPostHogConfig } from "@posthog/nextjs-config";
import createNextIntlPlugin from "next-intl/plugin";
import "./src/libs/Env";

const isDev = process.env.NODE_ENV === "development";

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  reactCompiler: !isDev,
  async rewrites() {
    return [
      {
        source: "/relay-FBSt/static/:path*", // FBSt = FrostByte Software template
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/relay-FBSt/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

const configWithIntl = createNextIntlPlugin("./src/libs/i18n/request.ts")(baseConfig);

const configWithAnalyzer = process.env.ANALYZE === "true"
  ? withBundleAnalyzer()(configWithIntl)
  : configWithIntl;

// Upload source maps in production when PostHog credentials are configured.
const configWithPostHog
  = process.env.NODE_ENV === "production"
    && process.env.POSTHOG_API_KEY
    && process.env.POSTHOG_PROJECT_ID
    ? withPostHogConfig(configWithAnalyzer, {
        personalApiKey: process.env.POSTHOG_API_KEY,
        projectId: process.env.POSTHOG_PROJECT_ID,
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        sourcemaps: {
          enabled: true,
          deleteAfterUpload: true,
        },
      })
    : configWithAnalyzer;

export default configWithPostHog;
