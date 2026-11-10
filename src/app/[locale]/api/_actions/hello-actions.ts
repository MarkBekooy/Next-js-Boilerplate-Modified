"use server";

// oxlint-disable-next-line require-await, @clerk/next/require-auth-protection -- This examplary server action is public so no need for authentication.
export async function sayHelloFromServerAction() {
  return "Hello from server action";
}
