import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/libs/db/schema";
import { Env } from "@/libs/Env";

// Tested and compatible with Next.js Boilerplate
export const createDbConnection = () => {
  const pool = new Pool({
    connectionString: Env.DATABASE_URL,
    ssl: !Env.DATABASE_URL.includes("localhost") && !Env.DATABASE_URL.includes("127.0.0.1"),
    max: 1,
  });

  return drizzle({
    client: pool,
    casing: "snake_case",
    schema,
  });
};
