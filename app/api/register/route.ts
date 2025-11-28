// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/db";
import User from "@/db/models/User";

export async function POST(req: Request) {
    await connectDB();
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!name || !email || password.length < 6) {
        return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) return NextResponse.json({ message: "User already exists" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed });

    return NextResponse.json({ message: "User registered" });
}
