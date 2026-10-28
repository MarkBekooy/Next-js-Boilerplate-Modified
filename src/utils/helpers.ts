import { Env } from "@/libs/env";

export function getBaseUrl() {
  if (Env.NEXT_PUBLIC_APP_URL) {
    return Env.NEXT_PUBLIC_APP_URL;
  }

  if (Env.VERCEL_ENV === "production" && Env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${Env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (Env.VERCEL_URL) {
    return `https://${Env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT || 3000}`;
}

export function isServer() {
  return typeof window === "undefined";
}
