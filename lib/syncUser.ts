// lib/syncUser.ts
import { currentUser } from "@clerk/nextjs/server";
import {connectDB} from "@/lib/db";
import User from "@/db/models/User";

export async function syncUser() {
  await connectDB();

  const clerkUser = await currentUser();
  if (!clerkUser) return;

  await User.findOneAndUpdate(
    { clerkId: clerkUser.id },
    {
      $set: { lastSeen: new Date() },
      $setOnInsert: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        name: clerkUser.fullName || clerkUser.firstName,
        role: "user",
      },
    },
    { new: true, upsert: true }
  );
}
