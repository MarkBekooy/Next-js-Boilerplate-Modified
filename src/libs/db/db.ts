import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/libs/db/schema";
import { Env } from "../Env";

// Stores the db connection in the global scope to prevent multiple instances due to hot reloading with Next.js
const globalForDb = globalThis as unknown as {
  drizzle: NodePgDatabase<typeof schema>;
};

// Tested and compatible with Next.js Boilerplate
const createDbConnection = () => {
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

const db = globalForDb.drizzle || createDbConnection();

// Only store in global during development to prevent hot reload issues
if (Env.NODE_ENV !== "production") {
  globalForDb.drizzle = db;
}

export { db };
