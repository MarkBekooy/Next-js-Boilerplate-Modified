import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "@/libs/db/relations";
import { Env } from "@/libs/env";
import { logger } from "@/libs/logger";

export function createDbConnection() {
  const pool = new Pool({
    connectionString: Env.DATABASE_URL,
    ssl: !Env.DATABASE_URL.includes("localhost") && !Env.DATABASE_URL.includes("127.0.0.1"),
  });

  pool.on("error", (error) => {
    logger.error(`Database pool error: ${error.message}`);
  });

  return drizzle({
    client: pool,
    relations,
  });
}
