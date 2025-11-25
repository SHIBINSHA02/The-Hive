// app/(auth)/register/page.tsx
// app/api/register/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
    const { name, email, password } = await req.json();

    const client = await clientPromise;
    const db = client.db("theHive");

    const existing = await db.collection("users").findOne({ email });
    if (existing) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    await db.collection("users").insertOne({
        name,
        email,
        password: hashedPassword,
    });

    return NextResponse.json({ ok: true });
}
