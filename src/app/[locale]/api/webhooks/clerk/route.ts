import type { UserWebhookEvent, WebhookEvent } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { db } from "@/libs/db/db";
import { usersSchema } from "@/libs/db/schema";
import { Env } from "@/libs/env";
import { logger } from "@/libs/logger";
import { tryCatch } from "@/utils/try-catch";
import {
  clerkUserInsertSchema,
  clerkUserSoftDeleteSchema,
  clerkUserUpdateSchema,
} from "@/validations/user-validation";

type VerificationResult = { event: WebhookEvent } | { response: NextResponse };

type UserCreatedEvent = UserWebhookEvent & { type: "user.created" };

type UserUpdatedEvent = UserWebhookEvent & { type: "user.updated" };

type UserDeletedEvent = Extract<WebhookEvent, { type: "user.deleted" }>;

const webhookSecret = Env.CLERK_WEBHOOK_SECRET;

function isUserCreatedEvent(event: WebhookEvent): event is UserCreatedEvent {
  return event.type === "user.created";
}

function isUserUpdatedEvent(event: WebhookEvent): event is UserUpdatedEvent {
  return event.type === "user.updated";
}

async function verifyWebhook(
  request: Request,
  secret: string
): Promise<VerificationResult> {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return {
      response: NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 }
      ),
    };
  }

  const body = await request.text();

  const { data: verifiedWebhook, error: webhookVerificationError } = tryCatch(
    () => {
      new Webhook(secret).verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });

      // SAFETY: Svix verified the signed Clerk payload before it is parsed as Clerk's event type.
      return { event: JSON.parse(body) as WebhookEvent };
    }
  );

  if (webhookVerificationError) {
    logger.error("Error verifying webhook", {
      error: webhookVerificationError,
    });

    return {
      response: NextResponse.json(
        { error: "Error verifying webhook" },
        { status: 400 }
      ),
    };
  }

  return verifiedWebhook;
}

async function createUser(event: UserCreatedEvent) {
  const { id, email_addresses, first_name, last_name } = event.data;

  const email = email_addresses.find(
    (item) => item.id === event.data.primary_email_address_id
  )?.email_address;

  if (!email) {
    logger.error(`No email found for user ${id}`);

    return NextResponse.json(
      { error: "No email found for user" },
      { status: 400 }
    );
  }

  const { error: userCreationError } = await tryCatch(async () => {
    const [createdUser] = await db
      .insert(usersSchema)
      .values(
        clerkUserInsertSchema.parse({
          authUserId: id,
          email,
          firstName: first_name ?? null,
          lastName: last_name ?? null,
        })
      )
      .onConflictDoNothing({ target: usersSchema.authUserId })
      .returning({ id: usersSchema.id });

    if (createdUser) {
      logger.info(`Created user ${id}`);
    } else {
      logger.info(`User already exists ${id}`);
    }
  });

  if (userCreationError) {
    logger.error(`Error creating user ${id}`, { error: userCreationError });

    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

async function updateUser(event: UserUpdatedEvent) {
  const { id, email_addresses, first_name, last_name } = event.data;

  const email = email_addresses.find(
    (item) => item.id === event.data.primary_email_address_id
  )?.email_address;

  if (email) {
    const { error: userUpdateError } = await tryCatch(async () => {
      const [updatedUser] = await db
        .update(usersSchema)
        .set(
          clerkUserUpdateSchema.parse({
            email,
            firstName: first_name ?? null,
            lastName: last_name ?? null,
          })
        )
        .where(
          and(eq(usersSchema.authUserId, id), isNull(usersSchema.deletedAt))
        )
        .returning({ id: usersSchema.id });

      if (updatedUser) {
        logger.info(`Updated user ${id}`);
      } else {
        logger.warn(`No active user found to update for ${id}`);
      }
    });

    if (userUpdateError) {
      logger.error(`Error updating user ${id}`, { error: userUpdateError });

      return NextResponse.json(
        { error: "Error updating user" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}

async function deleteUser(event: UserDeletedEvent) {
  const { id } = event.data;

  if (id) {
    const { error: userDeletionError } = await tryCatch(async () => {
      const [deletedUser] = await db
        .update(usersSchema)
        .set(clerkUserSoftDeleteSchema.parse({ deletedAt: new Date() }))
        .where(
          and(eq(usersSchema.authUserId, id), isNull(usersSchema.deletedAt))
        )
        .returning({ id: usersSchema.id });

      if (deletedUser) {
        logger.info(`Soft deleted user ${id}`);
      } else {
        logger.warn(`No active user found to soft delete for ${id}`);
      }
    });

    if (userDeletionError) {
      logger.error(`Error deleting user ${id}`, { error: userDeletionError });

      return NextResponse.json(
        { error: "Error deleting user" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  if (!webhookSecret) {
    logger.error("CLERK_WEBHOOK_SECRET is not configured");

    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const verification = await verifyWebhook(request, webhookSecret);

  if ("response" in verification) {
    return verification.response;
  }

  if (isUserCreatedEvent(verification.event)) {
    return createUser(verification.event);
  }

  if (isUserUpdatedEvent(verification.event)) {
    return updateUser(verification.event);
  }

  if (verification.event.type === "user.deleted") {
    return deleteUser(verification.event);
  }

  return NextResponse.json({ success: true });
}
