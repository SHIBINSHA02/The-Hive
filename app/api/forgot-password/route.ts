// app/api/forgot-password/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/db";
import User from "@/db/models/User";
import { sendResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
    await connectDB();
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
        return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        // don't reveal whether email exists — still return success message
        return NextResponse.json({ message: "If that email exists, a reset link was sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 minutes
    await user.save();

    await sendResetEmail(String(user.email), token);

    return NextResponse.json({ message: "If that email exists, a reset link was sent" });
}
