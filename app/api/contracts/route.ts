// app/api/contracts/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { connectDB } from "@/lib/db";
import User from "@/db/models/User";
import Contract from "@/db/models/Contract";
import ClientProfile from "@/db/models/ClientProfile";
import ContractProfile from "@/db/models/ContractProfile";

export async function GET() {
  try {
    await connectDB();

    const { userId: clerkId } = await  auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ clerkId });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const clientProfile = await ClientProfile.findOne({ user: user._id });
    const contractorProfile = await ContractProfile.findOne({ user: user._id });

    const conditions: Record<string, unknown>[] = [];

    if (clientProfile) conditions.push({ client: clientProfile._id });
    if (contractorProfile) conditions.push({ contractor: contractorProfile._id });

    if (!conditions.length) return NextResponse.json([], { status: 200 });

    const contracts = await Contract.find({ $or: conditions })
      .populate("client")
      .populate("contractor")
      .sort({ createdAt: -1 });

    return NextResponse.json(contracts);
  } catch (err: unknown) {
    console.error("GET Contracts Error", err);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ clerkId });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const clientProfile = await ClientProfile.findOne({ user: user._id });
    if (!clientProfile)
      return NextResponse.json(
        { error: "Client profile not found" },
        { status: 404 }
      );

    const body = await req.json();

    const contract = await Contract.create({
      ...body,
      client: clientProfile._id
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (err: unknown) {
    console.error("POST Contract Error", err);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
