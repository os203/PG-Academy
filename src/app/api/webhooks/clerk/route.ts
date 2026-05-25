import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const { id } = evt.data
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { email_addresses, first_name, last_name } = evt.data;
    
    // Fallback if missing
    const email = email_addresses[0]?.email_address || `no-email-${id}@example.com`;
    const name = [first_name, last_name].filter(Boolean).join(" ") || "New User";

    const role = ((evt.data.public_metadata?.role as string) || 'STUDENT') as "STUDENT" | "INSTRUCTOR" | "ADMIN";

    try {
      await db.user.upsert({
        where: { id: id as string },
        update: {
          email,
          name,
          role: role,
        },
        create: {
          id: id as string,
          email,
          name,
          password: 'clerk-managed',
          role: role,
        }
      });
      console.log(`Synced DB user for Clerk ID: ${id}`);
    } catch (error) {
      console.error("Error creating user in DB:", error);
      return new Response("Error creating user", { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ");

    try {
      const updateData: { email?: string; name?: string } = {};
      if (email) updateData.email = email;
      if (name) updateData.name = name;

      if (Object.keys(updateData).length > 0) {
        await db.user.update({
          where: { id: id as string },
          data: updateData
        });
      }
    } catch (error) {
      console.error("Error updating user in DB:", error);
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await db.user.delete({
        where: { id: id as string }
      });
    } catch (error) {
      console.error("Error deleting user in DB:", error);
    }
  }

  return new Response('', { status: 200 })
}
