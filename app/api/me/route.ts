import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/db/models/User";

export async function GET() {
  const { userId } = await auth();   // <-- IMPORTANT

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    { lastSeen: new Date() },
    { new: true }
  );

  return Response.json(user);
}
