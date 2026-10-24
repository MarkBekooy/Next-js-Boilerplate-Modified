"use server";

// oxlint-disable-next-line require-await -- Next.js server actions must be async.
export async function sayHelloFromServerAction() {
  return "Hello from server action";
}
