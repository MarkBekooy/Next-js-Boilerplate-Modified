import type { UserWebhookEvent, WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/libs/db/db";
import { usersSchema } from "@/libs/db/schema";
import { Env } from "@/libs/Env";

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

async function verifyWebhook(request: Request, secret: string): Promise<VerificationResult> {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return { response: NextResponse.json({ error: "Missing svix headers" }, { status: 400 }) };
  }

  const body = await request.text();

  try {
    new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    // SAFETY: Svix verified the signed Clerk payload before it is parsed as Clerk's event type.
    return { event: JSON.parse(body) as WebhookEvent };
  } catch (error) {
    console.error("Error verifying webhook:", error);

    return { response: NextResponse.json({ error: "Error verifying webhook" }, { status: 400 }) };
  }
}

async function createUser(event: UserCreatedEvent) {
  const { id, email_addresses, first_name, last_name } = event.data;

  const email = email_addresses.find(
    (item) => item.id === event.data.primary_email_address_id,
  )?.email_address;

  if (!email) {
    console.error("No email found for user:", id);

    return NextResponse.json({ error: "No email found for user" }, { status: 400 });
  }

  try {
    const existingUsers = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.authUserId, id))
      .limit(1);

    if (existingUsers.length === 0) {
      await db.insert(usersSchema).values({
        authUserId: id,
        email,
        firstName: first_name ?? null,
        lastName: last_name ?? null,
      });
      console.log("Created user:", id);
    } else {
      console.log("User already exists:", id);
    }
  } catch (error) {
    console.error("Error creating user:", error);

    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

async function updateUser(event: UserUpdatedEvent) {
  const { id, email_addresses, first_name, last_name } = event.data;

  const email = email_addresses.find(
    (item) => item.id === event.data.primary_email_address_id,
  )?.email_address;

  if (email) {
    try {
      await db
        .update(usersSchema)
        .set({ email, firstName: first_name ?? null, lastName: last_name ?? null })
        .where(eq(usersSchema.authUserId, id));
      console.log("Updated user:", id);
    } catch (error) {
      console.error("Error updating user:", error);

      return NextResponse.json({ error: "Error updating user" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

async function deleteUser(event: UserDeletedEvent) {
  const { id } = event.data;

  if (id) {
    try {
      await db
        .update(usersSchema)
        .set({ deletedAt: new Date() })
        .where(eq(usersSchema.authUserId, id));
      console.log("Soft deleted user:", id);
    } catch (error) {
      console.error("Error deleting user:", error);

      return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not configured");

    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
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
