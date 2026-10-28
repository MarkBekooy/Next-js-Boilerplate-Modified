import { defineConfig } from "oxlint";
import type { OxlintConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import next from "ultracite/oxlint/next";
import nextJsPlugins from "ultracite/oxlint/next/js-plugins";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";
import tanstackJsPlugins from "ultracite/oxlint/tanstack/js-plugins";
import vitestPreset from "ultracite/oxlint/vitest";

import clerk from "./oxlint/clerk.mjs";
import tailwind from "./oxlint/tailwind.mjs";

const jsPlugins = selectJsPlugins(["github", "react-doctor"]);
const drizzleJsPlugin = { name: "drizzle", specifier: "eslint-plugin-drizzle" };

const nextIntlJsPlugin = {
  name: "next-intl",
  specifier: "./oxlint/next-intl.mjs",
};

const shadcnJsPlugin = { name: "shadcn", specifier: "@shadcn/lint" };

const vitest = {
  ...vitestPreset,
  overrides: vitestPreset.overrides?.map((override) => ({
    ...override,
    rules: {
      ...override.rules,
      "vitest/prefer-import-in-mock": "off",
    },
  })),
} satisfies OxlintConfig;

export default defineConfig({
  extends: [
    core,
    react,
    next,
    nextJsPlugins,
    jsPlugins,
    clerk,
    tanstack,
    tanstackJsPlugins,
    tailwind,
    antiSlop,
    vitest,
  ],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    ".agents/skills/**/*",
    "migrations/**/*",
    "src/components/ui/**/*",
  ],
  jsPlugins: [
    ...(jsPlugins.jsPlugins ?? []),
    drizzleJsPlugin,
    nextIntlJsPlugin,
    shadcnJsPlugin,
  ],
  options: {
    reportUnusedDisableDirectives: "error",
  },
  overrides: [
    {
      files: ["src/libs/db/schema.ts"],
      rules: {
        "sort-keys": "off",
      },
    },
    {
      files: ["src/instrumentation.ts", "src/utils/try-catch.ts"],
      rules: {
        "anti-slop/require-safety-comment-for-type-assertion": "off",
      },
    },
    {
      files: ["src/app/**/route.ts", "src/app/**/*-actions.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "next/link",
                message: "Use `Link` from `@/libs/i18n/navigation`.",
              },
              {
                name: "next-intl/server",
                importNames: ["setRequestLocale"],
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
  rules: {
    "anti-slop/no-module-mocking": "off",
    "anti-slop/no-runtime-typeof": ["error", { allowInTypeGuards: true }],
    "drizzle/enforce-delete-with-where": [
      "error",
      { drizzleObjectName: ["db", "tx"] },
    ],
    "drizzle/enforce-update-with-where": [
      "error",
      { drizzleObjectName: ["db", "tx"] },
    ],
    "func-style": ["error", "declaration"],
    "jsdoc/require-param": "error",
    "jsdoc/require-returns": "error",
    "max-lines": ["error", { max: 500 }],
    "max-lines-per-function": [
      "error",
      { max: 100, skipBlankLines: true, skipComments: true },
    ],
    "no-inline-comments": "off",
    "next-intl/no-locale-from-route-params": "error",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "next/link",
            message: "Use `Link` from `@/libs/i18n/navigation`.",
          },
          {
            name: "next-intl/server",
            importNames: ["setRequestLocale"],
            message:
              "Use `next/root-params`; `setRequestLocale` is deprecated.",
          },
        ],
      },
    ],
    "no-use-before-define": ["error", { functions: false }],
    "no-warning-comments": "off",
    "react-doctor/no-giant-component": "off",
    "react/function-component-definition": [
      "error",
      {
        namedComponents: "function-declaration",
        unnamedComponents: "function-expression",
      },
    ],
    "typescript/consistent-type-definitions": ["error", "type"],
    "unicorn/filename-case": "off",
    "github/filenames-match-regex": "off",
  },
  settings: {
    ...jsPluginSettings,
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
    shadcn: {
      note: "Read DESIGN.md for design rules and approved exceptions.",
    },
    tailwindcss: {
      entryPoint: "src/app/globals.css",
    },
  },
});
