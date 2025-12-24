// app/api/me/route.ts
import { auth } from "@clerk/nextjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  await connectDB();

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    { lastSeen: new Date() },
    { new: true }
  );

  return Response.json(user);
}
