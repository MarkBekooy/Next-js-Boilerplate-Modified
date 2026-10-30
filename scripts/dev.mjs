import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";
import { promisify } from "node:util";

import { startDatabase } from "./dev-database.mjs";

const require = createRequire(import.meta.url);
const executeFile = promisify(execFile);
const directory = process.cwd();
const databaseStartup = startDatabase(directory);
let nextProcess;
let shutdownPromise;

function reportFailure(error) {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
}

async function stopNext() {
  if (
    !nextProcess?.pid ||
    nextProcess.exitCode !== null ||
    nextProcess.signalCode !== null
  ) {
    return;
  }

  const exited = once(nextProcess, "exit");

  if (process.platform === "win32") {
    // Windows signals kill only the CLI, leaving Next's worker running.
    await executeFile("taskkill", [
      "/PID",
      String(nextProcess.pid),
      "/T",
      "/F",
    ]).catch((error) => {
      if (nextProcess.exitCode === null && nextProcess.signalCode === null) {
        throw error;
      }
    });
  } else {
    nextProcess.kill("SIGTERM");
  }

  await exited;
}

async function closeResources(code) {
  process.exitCode = code;

  try {
    await stopNext();
  } finally {
    // Startup errors are reported by main, which also closes partially opened resources.
    const database = await databaseStartup.catch(() => null);
    await database?.close();

    if (process.connected) {
      process.disconnect();
    }
  }
}

function shutdown(code) {
  shutdownPromise ??= closeResources(code).catch(reportFailure);

  return shutdownPromise;
}

function handleSignal() {
  shutdown(0);
}

process.on("SIGINT", handleSignal);

process.on("SIGTERM", handleSignal);

process.on("SIGHUP", handleSignal);

process.on("disconnect", handleSignal);

function handleNextError(error) {
  reportFailure(error);
  shutdown(1);
}

function handleNextExit(code) {
  shutdown(code ?? 1);
}

async function main() {
  const { databaseUrl } = await databaseStartup;

  if (shutdownPromise) {
    return;
  }

  process.stdout.write(`PGlite (local database): ${databaseUrl}\n`);

  if (process.argv[2] === "--database-only") {
    return;
  }

  const nextEnv = { ...process.env, DATABASE_URL: databaseUrl };

  // An inherited PORT disables Next's automatic retry on occupied ports.
  delete nextEnv.PORT;

  nextProcess = spawn(
    process.execPath,
    [require.resolve("next/dist/bin/next"), "dev", ...process.argv.slice(2)],
    {
      cwd: directory,
      env: nextEnv,
      stdio: "inherit",
    }
  );
  nextProcess.once("error", handleNextError);
  nextProcess.once("exit", handleNextExit);
}

await main().catch(async (error) => {
  reportFailure(error);
  await shutdown(1);
});
