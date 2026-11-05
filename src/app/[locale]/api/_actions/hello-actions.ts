"use server";

// oxlint-disable-next-line @clerk/next/require-auth-protection -- This examplary server action is public so no need for authentication.
export function sayHelloFromServerAction() {
  return "Hello from server action";
}
