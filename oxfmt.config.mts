import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  extends: [ultracite],
  ignorePatterns: ["migrations/*", "src/components/ui/**/*"],
  sortTailwindcss: {
    stylesheet: "./src/app/globals.css",
  },
});
