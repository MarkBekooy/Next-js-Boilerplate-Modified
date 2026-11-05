// oxlint-disable vitest/no-import-node-test -- Run Oxlint RuleTester with Node's test runner.
import { describe, it } from "node:test";

import { RuleTester } from "oxlint/plugins-dev";

import http from "./http-plugin.mjs";

RuleTester.describe = describe;

RuleTester.it = it;

const tester = new RuleTester();
const imported = 'import { tryCatch } from "@/utils/try-catch";';

const guarded = `const response = await fetch(url);
if (!response.ok) throw new Error("HTTP failure");`;

tester.run("require-fetch-ok", http.rules["require-fetch-ok"], {
  valid: [
    `${imported} async function load() {
      ${guarded}
      return await tryCatch(() => response.json());
    }`,
    `${imported} async function load() {
      ${guarded}
      return await tryCatch(async function () { return await response.json(); });
    }`,
    `import { tryCatch as attempt } from "@/utils/try-catch";
    async function load() { ${guarded} return attempt(() => response.text()); }`,
    `import * as errors from "@/utils/try-catch";
    async function load() { ${guarded} return errors.tryCatch(() => response.json()); }`,
    'if (!(await fetch(url)).ok) throw new Error("HTTP failure");',
    "const status = (await fetch(url)).status;",
    "const headers = (await fetch(url)).headers;",
    'const ok = (await fetch(url))["ok"];',
    `${imported} const status = (await tryCatch(() => fetch(url))).data.status;`,
    `async function load() { ${guarded} return response.json(); }`,
    `${imported} async function load() {
      const response = await fetch(url);
      return tryCatch(() => {
        if (!response.ok) throw new Error("HTTP failure");
        return response.json();
      });
    }`,
  ],
  invalid: [
    ...["json", "text", "blob", "arrayBuffer", "formData", "bytes", "body"].map(
      (member) => ({
        code: `const body = (await fetch(url)).${member}${member === "body" ? "" : "()"};`,
        errors: [{ messageId: "checkStatus" }],
      })
    ),
    {
      code: `${imported} const body = (await tryCatch(() => fetch(url))).data.json();`,
      errors: [{ messageId: "checkStatus" }],
    },
    {
      code: `${imported} async function load() {
        const response = await fetch(url);
        tryCatch(() => { if (!response.ok) throw new Error("HTTP failure"); });
        return response.json();
      }`,
      errors: [{ messageId: "checkStatus" }],
    },
    {
      code: `${imported} async function load() {
        const response = await fetch(url);
        return tryCatch(() => response.json());
      }`,
      errors: [{ messageId: "checkStatus" }],
    },
    {
      code: `${imported} async function load() {
        const response = await fetch(url);
        const parsed = tryCatch(() => response.json());
        if (!response.ok) throw new Error("HTTP failure");
        return parsed;
      }`,
      errors: [{ messageId: "checkStatus" }],
    },
    {
      code: `async function load() {
        ${guarded}
        return unrelated(() => response.json());
      }`,
      errors: [{ messageId: "checkStatus" }],
    },
    {
      code: `import { tryCatch } from "another-package";
      async function load() { ${guarded} return tryCatch(() => response.json()); }`,
      errors: [{ messageId: "checkStatus" }],
    },
  ],
});
