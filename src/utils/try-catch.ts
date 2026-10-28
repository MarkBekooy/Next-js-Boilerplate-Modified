type Success<T> = { data: T; error: null };

type Failure<E> = { data: null; error: E };

type ResultSync<T, E> = Success<T> | Failure<E>;

type ResultAsync<T, E> = Promise<ResultSync<T, E>>;

export function tryCatch<T, E = Error>(
  operation: Promise<T>
): ResultAsync<T, E>;
export function tryCatch<T, E = Error>(
  operation: () => T
):
  | ResultSync<Awaited<T>, E>
  | (T extends Promise<unknown> ? ResultAsync<Awaited<T>, E> : never);
export function tryCatch<T, E = Error>(
  operation: () => T | Promise<T>
): ResultSync<T, E> | ResultAsync<T, E>;
export function tryCatch<T, E = Error>(
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
    return { data: null, error: error as E };
  }
}

function isOperationFunction<T>(
  operation: Promise<T> | (() => T | Promise<T>)
): operation is () => T | Promise<T> {
  return typeof operation === "function";
}

async function tryCatchAsync<T, E>(operation: Promise<T>): ResultAsync<T, E> {
  try {
    const data = await operation;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
