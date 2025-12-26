// app/api/me/route.ts
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/db/models/User";

import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();   // <-- IMPORTANT

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();


const clerkUser = await currentUser();

const user = await User.findOneAndUpdate(
  { clerkId: userId },
  {
    $set: { lastSeen: new Date() },
    $setOnInsert: {
      clerkId: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
      name: clerkUser?.firstName,
    }
  },
  { new: true, upsert: true }
);


  return Response.json(user);
}
