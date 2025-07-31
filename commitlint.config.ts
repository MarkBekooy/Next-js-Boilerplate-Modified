import type { UserConfig } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [0, "never", ["sentence-case", "start-case", "pascal-case"]],
  },
  ignores: [message => message.startsWith("chore: bump")], // Ignore dependabot commits
};

export default Configuration;
