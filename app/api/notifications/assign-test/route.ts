// app/api/notifications/assign-test/route.ts
// This endpoint assigns test notifications to the current logged-in user
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/db/models/User";
import Notification from "@/db/models/Notification";
import mongoose from "mongoose";

export async function POST() {
  try {
    await connectDB();

    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find the current user
    let currentUser = await User.findOne({ clerkId });
    if (!currentUser) {
      return NextResponse.json({ 
        error: "User not found. Please log in first.",
      }, { status: 404 });
    }

    // Find any existing notifications from seeded users
    const seededUsers = await User.find({ clerkId: /^clerk_/ }).limit(1);
    
    if (seededUsers.length === 0) {
      return NextResponse.json({ 
        error: "No seeded users found. Please run the seed script first.",
        message: "Run: npm run seed"
      }, { status: 404 });
    }

    const seededUser = seededUsers[0];
    const sampleNotifications = await Notification.find({ user: seededUser._id })
      .limit(15)
      .lean();

    if (sampleNotifications.length === 0) {
      return NextResponse.json({ 
        error: "No notifications found. Please run the seed script first.",
        message: "Run: npm run seed"
      }, { status: 404 });
    }

    // Delete existing notifications for this user (optional - remove if you want to keep them)
    await Notification.deleteMany({ user: currentUser._id });

    // Create test notifications for the current user
    const notificationsToCreate = sampleNotifications.map((n) => ({
      ...n,
      _id: new mongoose.Types.ObjectId(),
      user: currentUser._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Notification.insertMany(notificationsToCreate);

    return NextResponse.json({
      success: true,
      message: `Assigned ${notificationsToCreate.length} test notifications to your account`,
      count: notificationsToCreate.length
    });
  } catch (err: unknown) {
    console.error("Assign Test Notifications Error", err);
    return NextResponse.json(
      { 
        error: "Failed to assign test notifications",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
