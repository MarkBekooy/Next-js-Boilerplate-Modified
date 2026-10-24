import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "@clerk/next", specifier: "@clerk/eslint-plugin/next" }],
  rules: {
    "@clerk/next/require-auth-protection": [
      "error",
      {
        protected: ["**"],
        public: [
          "src/app/[locale]/(auth)/**",
          "src/app/[locale]/(public)/**",
          "src/app/[locale]/api/_actions/hello-actions.ts",
          "src/app/[locale]/api/error/**",
          "src/app/[locale]/api/hello/**",
          "src/app/[locale]/api/webhooks/**",
          "src/app/[locale]/test/**",
        ],
      },
    ],
  },
});
