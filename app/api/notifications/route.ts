// app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/db/models/User";
import Notification from "@/db/models/Notification";

export async function GET() {
  try {
    await connectDB();

    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ clerkId });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch all notifications for the user
    const notifications = await Notification.find({ user: user._id })
      .populate("contract")
      .sort({ createdAt: -1 })
      .lean();

    // Sort by priority (urgent > high > medium > low) then by date
    const priorityOrder: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Transform to match the frontend Notification interface
    const formattedNotifications = notifications.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      description: n.description,
      priority: n.priority,
      status: n.status,
      contractName: n.contractName,
      contractId: n.contractId,
      amount: n.amount,
      dueDate: n.dueDate ? new Date(n.dueDate).toISOString().split('T')[0] : undefined,
      sender: n.sender,
      senderAvatar: n.senderAvatar,
      timestamp: n.createdAt.toISOString(),
      isRead: n.isRead,
      actions: n.actions || [],
    }));

    return NextResponse.json(formattedNotifications);
  } catch (err: unknown) {
    console.error("GET Notifications Error", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PATCH(req: Request) {
  try {
    await connectDB();

    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ clerkId });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: user._id },
      { isRead: isRead !== undefined ? isRead : true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, notification });
  } catch (err: unknown) {
    console.error("PATCH Notification Error", err);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
