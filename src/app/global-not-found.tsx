import { routing } from "@/libs/i18n/routing";
import "@/app/globals.css";

export default function GlobalNotFound() {
  return (
    <html lang={routing.defaultLocale}>
      <body>
        <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12">
          <div className="max-w-lg">
            <p className="text-sm font-medium text-muted-foreground">404</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
            <p className="mt-3 text-muted-foreground">
              The page you requested does not exist or is no longer available.
            </p>
            {/* oxlint-disable-next-line next/no-html-link-for-pages, react-doctor/nextjs-no-a-element -- global 404 bypasses the locale layout */}
            <a
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              href="/"
            >
              Go to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
