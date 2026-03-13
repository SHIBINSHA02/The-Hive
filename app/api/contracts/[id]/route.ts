import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import Financial from "@/db/models/Finance";
import { getContractAndRole } from "@/lib/contractAuth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getContractAndRole(id, clerkId);
  if (!result)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Safety: If this is Party B and we haven't linked their Clerk ID yet, do it now
  if (result.role === "partyB" && !result.contract.partyB_ClerkId) {
    await Contract.findOneAndUpdate({ contractId: id }, { $set: { partyB_ClerkId: clerkId } });
  }

  // result now includes 'owner' in the role union
  const { contract, role } = result;

  const client = (contract as any).client as { name?: string } | undefined;
  const contractor = (contract as any).contractor as { name?: string } | undefined;

  const clientName: string | undefined = client?.name;
  const contractorName: string | undefined = contractor?.name;

  // Updated logic for counterpartyName to handle 'owner'
  const counterpartyName =
    role === "client"
      ? contractorName
      : role === "contractor"
      ? clientName
      : contractorName || clientName || "Negotiation Pending"; // Fallback for owner

  const formattedContract = {
    _id: (contract as any)._id?.toString?.() ?? (contract as any)._id,
    contractId: (contract as any).contractId,
    contractTitle: (contract as any).contractTitle,
    companyName: (contract as any).companyName,
    companyLogoUrl: (contract as any).companyLogoUrl,
    bgImageUrl: (contract as any).bgImageUrl,
    description: (contract as any).description,
    summary: (contract as any).summary,
    startDate: (contract as any).startDate
      ? new Date((contract as any).startDate).toISOString()
      : new Date().toISOString(),
    deadline: (contract as any).deadline
      ? new Date((contract as any).deadline).toISOString()
      : new Date().toISOString(),
    progress: (contract as any).progress ?? 0,
    contractStatus: (contract as any).contractStatus ?? "pending",
    clauses: (contract as any).clauses ?? [],
    keypoints: (contract as any).keypoints ?? [],
    contractContent: (contract as any).contractContent ?? "",
    ownerSigned: (contract as any).ownerSigned ?? false,
    partyBSigned: (contract as any).partyBSigned ?? false,
    ownerAgreed: (contract as any).ownerAgreed ?? false,
    partyBAgreed: (contract as any).partyBAgreed ?? false,
    clientName,
    contractorName,
    viewerRole: role,
    counterpartyName,
  };

  const finance = await Financial.findOne({ contract: contract._id });

  return NextResponse.json({ contract: formattedContract, finance, role });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Safety check: Ensures the user has permission (owner, client, or contractor)
  const exists = await getContractAndRole(id, clerkId);
  if (!exists)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await connectDB();
  const body = await req.json();
  
  // Security: Ensure ownerId can't be updated
  delete body.ownerId;

  // If content is modified, reset agreements
  if (body.contractContent) {
    body.ownerAgreed = false;
    body.partyBAgreed = false;
  }

  const updated = await Contract.findOneAndUpdate({ contractId: id }, body, { new: true });

  return NextResponse.json(updated);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exists = await getContractAndRole(id, clerkId);
  if (!exists)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await connectDB();
  const body = await req.json();
  
  // Security: Ensure ownerId can't be patched
  delete body.ownerId;

  // If content is modified, reset agreements
  if (body.contractContent) {
    body.ownerAgreed = false;
    body.partyBAgreed = false;
  }

  const updated = await Contract.findOneAndUpdate(
    { contractId: id },
    { $set: body },
    { new: true }
  );

  return NextResponse.json(updated);
}