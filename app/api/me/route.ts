// app/api/me/route.ts
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "../../../lib/db";

import User from "@/db/models/User";

export async function GET() {
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  await connectDB();
  const user = await User.findOne({ clerkId: userId });

  return Response.json(user);
}
