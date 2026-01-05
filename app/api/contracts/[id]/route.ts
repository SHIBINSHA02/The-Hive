// app/api/contracts/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { connectDB } from "@/lib/db";
import User from "@/db/models/User";
import Contract from "@/db/models/Contract";
import ClientProfile from "@/db/models/ClientProfile";
import ContractProfile from "@/db/models/ContractProfile";

async function authorize(contractId: string, clerkId: string) {
  await connectDB();

  const user = await User.findOne({ clerkId });
  if (!user) return null;

  const clientProfile = await ClientProfile.findOne({ user: user._id });
  const contractorProfile = await ContractProfile.findOne({ user: user._id });

  const conditions: Record<string, unknown>[] = [];

  if (clientProfile) conditions.push({ client: clientProfile._id });
  if (contractorProfile) conditions.push({ contractor: contractorProfile._id });

  if (!conditions.length) return null;

  return Contract.findOne({
    _id: contractId,
    $or: conditions
  })
    .populate("client")
    .populate("contractor");
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } =await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contract = await authorize(params.id, clerkId);
  if (!contract)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(contract);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exists = await authorize(params.id, clerkId);
  if (!exists)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const updated = await Contract.findByIdAndUpdate(params.id, body, {
    new: true
  });

  return NextResponse.json(updated);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } =await  auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exists = await authorize(params.id, clerkId);
  if (!exists)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const updated = await Contract.findByIdAndUpdate(
    params.id,
    { $set: body },
    { new: true }
  );

  return NextResponse.json(updated);
}
