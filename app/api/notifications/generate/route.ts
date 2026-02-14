// app/api/notifications/generate/route.ts
// This endpoint is called by a daily cron job to generate notifications for all users
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { generateAllUserNotifications } from "@/lib/notificationService";

export async function POST(req: Request) {
  try {
    // Optional: Add authentication/authorization check for cron job
    // For Vercel Cron, you can check the Authorization header
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const result = await generateAllUserNotifications();

    return NextResponse.json({
      success: true,
      message: `Generated ${result.notificationsCreated} notifications for ${result.usersProcessed} users`,
      ...result
    });
  } catch (err: unknown) {
    console.error("Generate Notifications Error", err);
    return NextResponse.json(
      { 
        error: "Failed to generate notifications",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET() {
  try {
    await connectDB();

    const result = await generateAllUserNotifications();

    return NextResponse.json({
      success: true,
      message: `Generated ${result.notificationsCreated} notifications for ${result.usersProcessed} users`,
      ...result
    });
  } catch (err: unknown) {
    console.error("Generate Notifications Error", err);
    return NextResponse.json(
      { 
        error: "Failed to generate notifications",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
