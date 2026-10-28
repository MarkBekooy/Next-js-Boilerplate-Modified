// oxlint-disable anti-slop/require-readable-spacing -- Avoid databaseJsPlugin spacing issues

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
import nextIntl from "./oxlint/next-intl.mjs";
import tailwind from "./oxlint/tailwind.mjs";

const jsPlugins = selectJsPlugins(["github", "react-doctor"]);
const databaseJsPlugin = {
  name: "database",
  specifier: "./oxlint/database-plugin.mjs",
};
const drizzleJsPlugin = { name: "drizzle", specifier: "eslint-plugin-drizzle" };
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
    nextIntl,
  ],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    ".agents/skills/**/*",
    "migrations/**/*",
    "src/components/ui/**/*",
  ],
  jsPlugins: [
    ...(jsPlugins.jsPlugins ?? []),
    databaseJsPlugin,
    drizzleJsPlugin,
    ...(nextIntl.jsPlugins ?? []),
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
  ],
  rules: {
    "anti-slop/no-module-mocking": "off",
    "anti-slop/no-runtime-typeof": ["error", { allowInTypeGuards: true }],
    "database/require-validated-writes": "error",
    "drizzle/enforce-delete-with-where": [
      "error",
      { drizzleObjectName: ["db", "tx"] },
    ],
    "drizzle/enforce-update-with-where": [
      "error",
      { drizzleObjectName: ["db", "tx"] },
    ],
    "func-style": ["error", "declaration"],
    "github/filenames-match-regex": "off",
    "jsdoc/require-param": "error",
    "jsdoc/require-returns": "error",
    "max-lines": ["error", { max: 500 }],
    "max-lines-per-function": [
      "error",
      { max: 100, skipBlankLines: true, skipComments: true },
    ],
    "no-inline-comments": "off",
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
    "shadcn/no-inline-styles": "error",
    "shadcn/no-restyle": ["error", { allow: ["layout"] }],
    "shadcn/require-static-classes": "error",
    "typescript/consistent-type-definitions": ["error", "type"],
    "unicorn/filename-case": "off",
  },
  settings: {
    ...jsPluginSettings,
    ...nextIntl.settings,
    shadcn: {
      note: "Read DESIGN.md for design rules and approved exceptions.",
    },
    tailwindcss: {
      entryPoint: "src/app/globals.css",
    },
  },
});
