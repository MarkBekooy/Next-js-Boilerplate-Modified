import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `pnpm db:generate --name=<migration-name>`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
};

export const usersSchema = pgTable("users", {
  id: uuid("id").primaryKey().$defaultFn(uuidv7),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  authUserId: text("auth_user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  ...timestamps,
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, table => [
  uniqueIndex("email_idx").on(table.email),
  uniqueIndex("user_auth_user_id_idx").on(table.authUserId),
  uniqueIndex("user_stripe_customer_id_idx").on(table.stripeCustomerId),
]);
