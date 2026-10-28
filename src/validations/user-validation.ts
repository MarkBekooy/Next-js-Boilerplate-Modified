import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";

import { usersSchema } from "@/libs/db/schema";

export const clerkUserInsertSchema = createInsertSchema(usersSchema).pick({
  authUserId: true,
  email: true,
  firstName: true,
  lastName: true,
});

export const clerkUserUpdateSchema = createUpdateSchema(usersSchema).pick({
  email: true,
  firstName: true,
  lastName: true,
});

export const clerkUserSoftDeleteSchema = createUpdateSchema(usersSchema)
  .pick({ deletedAt: true })
  .required();
