<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI work

Read `DESIGN.md` and `.agents/skills/shadcn/SKILL.md` before creating or changing shadcn UI. Use `components.json` and `src/app/globals.css` as the source for component setup and theme tokens.

## Soft-deleted users

Normal user reads and profile updates must filter with `isNull(usersSchema.deletedAt)`. Relational queries use `where: { deletedAt: { isNull: true } }`. Drizzle does not apply this filter globally.

## Development servers

Use `pnpm dev` from the worktree root. Read the app URL from Next's startup output, since app and PGlite ports change each launch. Run one session per worktree. The launcher maintains `DATABASE_URL` in `.env.development.local` for separate database commands.
