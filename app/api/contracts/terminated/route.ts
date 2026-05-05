import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";

export async function DELETE() {
  try {
    await connectDB();
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only delete terminated contracts where the user is the owner
    const result = await Contract.deleteMany({
      ownerId: clerkId,
      contractStatus: "terminated"
    });

    return NextResponse.json({ 
      message: `Deleted ${result.deletedCount} terminated contracts`,
      count: result.deletedCount 
    });
  } catch (err: any) {
    console.error("Bulk Delete Error:", err);
    return NextResponse.json({ error: "Failed to delete contracts" }, { status: 500 });
  }
}
