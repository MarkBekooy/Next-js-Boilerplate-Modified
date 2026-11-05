import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { setImmediate } from "node:timers/promises";

import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

async function saveDatabaseUrl(directory, databaseUrl) {
  const envPath = path.join(directory, ".env.development.local");

  const content = await readFile(envPath, "utf-8").catch((error) => {
    if (error.code !== "ENOENT") {
      throw error;
    }

    return "";
  });

  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const assignment = `DATABASE_URL="${databaseUrl}"`;
  const existing = /^[\t ]*(?:export[\t ]+)?DATABASE_URL[\t ]*=[^\r\n]*/gmu;

  const updated = existing.test(content)
    ? content.replaceAll(existing, assignment)
    : `${content}${content && !content.endsWith("\n") ? newline : ""}${assignment}${newline}`;

  await writeFile(envPath, updated, { mode: 0o600 });
}

export async function startDatabase(directory) {
  const db = await PGlite.create(path.join(directory, "local.db"));
  const server = new PGLiteSocketServer({ db, host: "127.0.0.1", port: 0 });

  async function close() {
    try {
      await server.stop();
    } finally {
      // pglite-socket schedules socket-close handlers after its stop promise resolves.
      await setImmediate();
      await db.close();
    }
  }

  async function initialize() {
    await server.start();
    const databaseUrl = `postgresql://postgres:postgres@${server.getServerConn()}/postgres`;
    await saveDatabaseUrl(directory, databaseUrl);

    return { close, databaseUrl };
  }

  async function cleanupStartupFailure(error) {
    await close();
    throw error;
  }

  return initialize().catch(cleanupStartupFailure);
}
