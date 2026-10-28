type Success<T> = { data: T; error: null };

type Failure<E> = { data: null; error: E };

type ResultSync<T, E> = Success<T> | Failure<E>;

type ResultAsync<T, E> = Promise<ResultSync<T, E>>;

type CallbackResult<T, E> =
  | ResultSync<T extends Promise<unknown> ? Awaited<T> : T, E>
  | (T extends Promise<unknown> ? ResultAsync<Awaited<T>, E> : never)
  | (Promise<unknown> extends T ? ResultAsync<unknown, E> : never);

export function tryCatch<T, E extends Error = Error>(
  operation: Promise<T>
): ResultAsync<T, E>;
export function tryCatch<T, E extends Error = Error>(
  operation: () => T
): CallbackResult<T, E>;
export function tryCatch<T, E extends Error = Error>(
  operation: () => T | Promise<T>
): ResultSync<T, E> | ResultAsync<T, E>;
export function tryCatch<T, E extends Error = Error>(
  operation: Promise<T> | (() => T | Promise<T>)
): ResultSync<T, E> | ResultAsync<T, E> {
  if (!isOperationFunction(operation)) {
    return tryCatchAsync<T, E>(operation);
  }

  try {
    const data = operation();

    if (data instanceof Promise) {
      return tryCatchAsync<T, E>(data);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: normalizeError(error) as E };
  }
}

function isOperationFunction<T>(
  operation: Promise<T> | (() => T | Promise<T>)
): operation is () => T | Promise<T> {
  return typeof operation === "function";
}

// oxlint-disable-next-line anti-slop/no-unknown-parameters -- Catch values can be anything JavaScript can throw.
function normalizeError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error("Operation failed", { cause: error });
}

async function tryCatchAsync<T, E extends Error>(
  operation: Promise<T>
): ResultAsync<T, E> {
  try {
    const data = await operation;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: normalizeError(error) as E };
  }
}
