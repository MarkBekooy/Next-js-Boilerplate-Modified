import { fileURLToPath } from "node:url";

import { defineConfig } from "oxlint";

const localizedLink = {
  name: "next/link",
  message: "Use `Link` from `@/libs/i18n/navigation`.",
};

const requestLocale = {
  name: "next-intl/server",
  importNames: ["setRequestLocale"],
  message: "Use `next/root-params`; `setRequestLocale` is deprecated.",
};

export default defineConfig({
  jsPlugins: [
    {
      name: "next-intl",
      specifier: fileURLToPath(
        new URL("next-intl-plugin.mjs", import.meta.url)
      ),
    },
  ],
  rules: {
    "next-intl/no-locale-from-route-params": "error",
    "no-restricted-imports": [
      "error",
      { paths: [localizedLink, requestLocale] },
    ],
  },
  overrides: [
    {
      files: ["src/app/**/route.ts", "src/app/**/*-actions.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              localizedLink,
              {
                ...requestLocale,
                message:
                  "Use `next/root-params`; next-intl recommends reading the root locale directly.",
              },
              {
                name: "next/root-params",
                message:
                  "Root params are unavailable in Route Handlers and Server Actions. Pass the locale explicitly.",
              },
            ],
          },
        ],
      },
    },
  ],
  settings: {
    "jsx-a11y": {
      components: {
        IntentPrefetchLink: "a",
        Link: "a",
      },
    },
    react: {
      linkComponents: [
        { name: "Link", attribute: "href" },
        { name: "IntentPrefetchLink", attribute: "href" },
      ],
    },
  },
});
