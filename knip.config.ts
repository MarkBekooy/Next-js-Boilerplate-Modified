import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/libs/i18n/request.ts"],
  // Files to exclude from Knip analysis
  ignore: ["src/types/I18n.ts", "src/utils/Helpers.ts", "tests/**/*.ts"],
  // Dependencies to ignore during analysis
  ignoreDependencies: ["@commitlint/types", "conventional-changelog-conventionalcommits", "vite"],
  // Binaries to ignore during analysis
  ignoreBinaries: [
    "production", // False positive raised with dotenv-cli
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/gu)].join("\n"),
  },
};

export default config;
