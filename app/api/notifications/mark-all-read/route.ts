// app/api/notifications/mark-all-read/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/db/models/User";
import Notification from "@/db/models/Notification";

export async function POST() {
  try {
    await connectDB();

    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ clerkId });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const result = await Notification.updateMany(
      { user: user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      count: result.modifiedCount
    });
  } catch (err: unknown) {
    console.error("Mark All Read Error", err);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
