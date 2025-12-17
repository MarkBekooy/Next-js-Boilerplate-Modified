import type { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/libs/db/db";
import { usersSchema } from "@/libs/db/schema";
import { Env } from "@/libs/Env";

const webhookSecret = Env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Error verifying webhook" },
      { status: 400 },
    );
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Get primary email
    const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id);
    const email = primaryEmail?.email_address;

    if (!email) {
      console.error("No email found for user:", id);
      return NextResponse.json(
        { error: "No email found for user" },
        { status: 400 },
      );
    }

    try {
      // Check if user already exists (by authUserId)
      const existingUser = await db
        .select()
        .from(usersSchema)
        .where(eq(usersSchema.authUserId, id))
        .limit(1);

      if (existingUser.length === 0) {
        // Create new user
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
      return NextResponse.json(
        { error: "Error creating user" },
        { status: 500 },
      );
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Get primary email
    const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id);
    const email = primaryEmail?.email_address;

    if (email) {
      try {
        await db
          .update(usersSchema)
          .set({
            email,
            firstName: first_name ?? null,
            lastName: last_name ?? null,
          })
          .where(eq(usersSchema.authUserId, id));
        console.log("Updated user:", id);
      } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
          { error: "Error updating user" },
          { status: 500 },
        );
      }
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (id) {
      try {
        // Soft delete - set deletedAt timestamp
        await db
          .update(usersSchema)
          .set({ deletedAt: new Date() })
          .where(eq(usersSchema.authUserId, id));
        console.log("Soft deleted user:", id);
      } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
          { error: "Error deleting user" },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ success: true });
}
