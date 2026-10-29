"use client";

import { posthog } from "posthog-js";
import { useState, useTransition } from "react";

import { sayHelloFromServerAction } from "@/app/[locale]/api/_actions/hello-actions";
import { tryCatch } from "@/utils/try-catch";

export default function ActionPanel() {
  const [serverActionResult, setServerActionResult] = useState<string | null>(
    null
  );

  const [routeHandlerResult, setRouteHandlerResult] = useState<string | null>(
    null
  );

  const [isServerPending, startServerAction] = useTransition();
  const [isRoutePending, setIsRoutePending] = useState(false);

  function triggerServerAction() {
    startServerAction(async () => {
      const { data: greeting, error: serverActionError } = await tryCatch(
        sayHelloFromServerAction
      );

      setServerActionResult(
        serverActionError ? "Something went wrong" : greeting
      );
    });
    posthog.capture("test_event");
  }

  async function triggerRouteHandler() {
    setIsRoutePending(true);

    const { data: routeMessage, error: routeRequestError } = await tryCatch(
      async () => {
        const response = await fetch("/api/hello", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        // SAFETY: The request targets our /api/hello route, which returns an optional message string.
        const data = (await response.json()) as { message?: string };

        return data.message ?? "No response";
      }
    );

    if (routeRequestError) {
      setRouteHandlerResult("Something went wrong");
    } else {
      setRouteHandlerResult(routeMessage);
    }

    setIsRoutePending(false);
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-1 flex-col gap-3">
          <span className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Server action
          </span>
          <button
            type="button"
            onClick={triggerServerAction}
            disabled={isServerPending}
            className="w-full rounded-xl bg-black px-6 py-3 text-sm font-medium text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {isServerPending ? "Working..." : "Invoke server action"}
          </button>
          {serverActionResult && (
            <p className="text-sm text-zinc-600 dark:text-zinc-200">
              {serverActionResult}
            </p>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <span className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Route handler
          </span>
          <button
            type="button"
            onClick={triggerRouteHandler}
            disabled={isRoutePending}
            className="w-full rounded-xl border border-zinc-900/10 px-6 py-3 text-sm font-medium text-zinc-900 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-60 dark:border-zinc-100/10 dark:text-white"
          >
            {isRoutePending
              ? "Working..."
              : "Invoke API endpoint (route handler)"}
          </button>
          {routeHandlerResult && (
            <p className="text-sm text-zinc-600 dark:text-zinc-200">
              {routeHandlerResult}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
