import { Env } from "@/libs/Env";
import { createDbConnection } from "@/utils/db-connection";

// Stores the db connection in the global scope to prevent multiple instances due to hot reloading with Next.js
const globalForDb = globalThis as typeof globalThis & {
  cachedDrizzle?: ReturnType<typeof createDbConnection>;
};

const db = globalForDb.cachedDrizzle ?? createDbConnection();

// Only store in global during development to prevent hot reload issues
if (Env.NODE_ENV !== "production") {
  globalForDb.cachedDrizzle = db;
}

export { db };
