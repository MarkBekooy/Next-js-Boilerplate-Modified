import { defineConfig } from "drizzle-kit";
import { Env } from "./src/libs/Env";

export default defineConfig({
  out: "./migrations",
  schema: "./src/libs/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: Env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
