// app/api/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/db";
import User from "@/db/models/User";

export async function POST(req: Request) {
    await connectDB();
    const { token, password } = await req.json();

    if (!token || typeof token !== "string" || !password || String(password).length < 6) {
        return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    user.password = await bcrypt.hash(String(password), 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return NextResponse.json({ message: "Password updated" });
}
