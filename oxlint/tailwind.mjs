import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "tailwindcss", specifier: "oxlint-tailwindcss" }],
  rules: {
    "tailwindcss/consistent-variant-order": "warn",
    "tailwindcss/enforce-canonical": "warn",
    "tailwindcss/enforce-consistent-important-position": "warn",
    "tailwindcss/enforce-consistent-line-wrapping": "off",
    "tailwindcss/enforce-consistent-variable-syntax": "warn",
    "tailwindcss/enforce-logical": "off",
    "tailwindcss/enforce-negative-arbitrary-values": "warn",
    "tailwindcss/enforce-physical": "error",
    "tailwindcss/enforce-shorthand": "warn",
    "tailwindcss/enforce-sort-order": "warn",
    "tailwindcss/max-class-count": "warn",
    "tailwindcss/no-arbitrary-value": "off",
    "tailwindcss/no-conflicting-classes": "error",
    "tailwindcss/no-contradicting-variants": "warn",
    "tailwindcss/no-dark-without-light": "warn",
    "tailwindcss/no-deprecated-classes": "error",
    "tailwindcss/no-duplicate-classes": "error",
    "tailwindcss/no-hardcoded-colors": "warn",
    "tailwindcss/no-restricted-classes": [
      "error",
      {
        patterns: [{ message: "Use flexbox or grid", pattern: "^float-" }],
      },
    ],
    "tailwindcss/no-unknown-classes": "error",
    "tailwindcss/no-unnecessary-arbitrary-value": "warn",
    "tailwindcss/no-unnecessary-whitespace": "error",
    "tailwindcss/prefer-theme-tokens": "error",
  },
});
