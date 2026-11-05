import { NextResponse } from "next/server";

// oxlint-disable-next-line @clerk/next/require-auth-protection -- This examplary server route is public so no need for authentication.
export function GET() {
  return NextResponse.json({ message: "Hello from route handler" });
}
