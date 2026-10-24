import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "@clerk/next", specifier: "@clerk/eslint-plugin/next" }],
  rules: {
    "@clerk/next/require-auth-protection": [
      "error",
      {
        protected: ["src/app/[locale]/dashboard/**"],
        public: [
          "src/app/[locale]/(auth)/**",
          "src/app/[locale]/api/**",
          "src/app/[locale]/page.tsx",
          "src/app/[locale]/test/**",
        ],
      },
    ],
  },
});
