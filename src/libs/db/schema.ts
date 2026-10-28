import { boolean, snakeCase, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `pnpm db:generate --name=<migration-name>`

// Generation writes SQL files only. Review them and run `pnpm db:check`.
// Apply with `pnpm db:migrate` or `pnpm db:migrate:prod`. Migrations do not run automatically.

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const usersSchema = snakeCase.table("users", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  email: text().notNull().unique(),
  firstName: text(),
  lastName: text(),
  authUserId: text().notNull().unique(),
  stripeCustomerId: text().unique(),
  isAdmin: boolean().default(false).notNull(),
  ...timestamps,
  deletedAt: timestamp({ withTimezone: true }),
});
