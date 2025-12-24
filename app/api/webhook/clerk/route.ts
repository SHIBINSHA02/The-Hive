// app/api/webhook/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  const payload = await req.json();
  await connectDB();

  const eventType = payload.type;
  const user = payload.data;

  if (eventType === "user.created") {
    await User.create({
      clerkId: user.id,
      email: user.email_addresses[0].email_address,
      name: user.first_name || "" + " " + user.last_name || ""
    });
  }

  if (eventType === "user.deleted") {
    await User.deleteOne({ clerkId: user.id });
  }

  return new Response("OK");
}
