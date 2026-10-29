import "server-only";
import type { AsyncSink } from "@logtape/logtape";
import {
  configure,
  fromAsyncSink,
  getConsoleSink,
  getJsonLinesFormatter,
  getLogger,
} from "@logtape/logtape";

import { Env } from "./env";

async function betterStackSink(record: Parameters<AsyncSink>[0]) {
  const response = await fetch(
    `https://${Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN}`,
      },
      body: JSON.stringify(record),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Better Stack ingestion failed with HTTP ${response.status}`
    );
  }
}

await configure({
  sinks: {
    console: getConsoleSink({ formatter: getJsonLinesFormatter() }),
    betterStack: fromAsyncSink(betterStackSink),
  },
  loggers: [
    {
      category: ["logtape", "meta"],
      sinks: ["console"],
      lowestLevel: "warning",
    },
    {
      category: ["app"],
      sinks:
        Env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN &&
        Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST
          ? ["console", "betterStack"]
          : ["console"],
      lowestLevel: "debug",
    },
  ],
});

export const logger = getLogger(["app"]);
