import { describe, expect, it } from "vitest";
import { tryCatch } from "./try-catch";

describe("error capture", () => {
  it("captures a synchronous throw from a Promise-returning factory", () => {
    const failure = new Error("failed");

    const result = tryCatch((): Promise<string> => {
      throw failure;
    });

    expect(result).toStrictEqual({ data: null, error: failure });
  });
});
