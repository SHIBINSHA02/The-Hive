// app/api/me/route.ts
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/db/models/User";
import ClientProfile from "@/db/models/ClientProfile";
import ContractProfile from "@/db/models/ContractProfile";

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

  const [clientProfile, contractorProfile] = await Promise.all([
    ClientProfile.findOne({ user: user._id }).lean(),
    ContractProfile.findOne({ user: user._id }).lean(),
  ]);

  return Response.json({
    user,
    clientProfile,
    contractorProfile
  });
}
