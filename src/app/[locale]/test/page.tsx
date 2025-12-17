import { Button } from "@/components/ui/button";
import { Link } from "@/libs/I18nNavigation";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white px-4 py-20 font-sans antialiased dark:from-black dark:to-zinc-900">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 rounded-[32px] border border-zinc-200 bg-white/80 p-10 text-center shadow-xl backdrop-blur sm:p-16 dark:border-zinc-800 dark:bg-zinc-900/70">
        <h1 className="text-4xl font-semibold text-zinc-900 dark:text-zinc-50">
          Test Page
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">
          Simple route to confirm navigation works.
        </p>
        <div className="flex justify-center">
          <Button asChild className="p-5">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
