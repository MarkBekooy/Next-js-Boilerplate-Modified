import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "src/libs/i18n/request.ts",
    "tests/**/*.ts",
    // Reusable starter components and optional development diagnostics.
    "src/components/ui/**/*.tsx",
    "src/components/react-scan.tsx",
  ],
  // Files to exclude from Knip analysis
  ignore: [".agents/**", "src/types/i18n.ts", "src/utils/helpers.ts"],
  // Dependencies to ignore during analysis
  ignoreDependencies: ["conventional-changelog-conventionalcommits"],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/gu)].join("\n"),
  },
};

export default config;
