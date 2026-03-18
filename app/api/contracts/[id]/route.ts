import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import Financial from "@/db/models/Finance";
import { getContractAndRole } from "@/lib/contractAuth";

export const dynamic = "force-dynamic";
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
    const idFilter = mongoose.Types.ObjectId.isValid(id) 
      ? { $or: [{ _id: id }, { contractId: id }] }
      : { contractId: id };
    await Contract.findOneAndUpdate(idFilter, { $set: { partyB_ClerkId: clerkId } });
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
    contractStatus: ((contract as any).contractStatus === "pending" || !(contract as any).contractStatus) 
      ? "draft" 
      : (contract as any).contractStatus,
    partyB_Email: (contract as any).partyB_Email,
    clauses: (contract as any).clauses ?? [],
    keypoints: (contract as any).keypoints ?? [],
    contractContent: (contract as any).contractContent ?? "",
    ownerSigned: (contract as any).ownerSigned ?? false,
    partyBSigned: (contract as any).partyBSigned ?? false,
    ownerAgreed: (contract as any).ownerAgreed ?? false,
    partyBAgreed: (contract as any).partyBAgreed ?? false,
    currentTurn: (contract as any).currentTurn ?? "owner",
    // LECTURE: Add this line to send the backup snapshots to the browser!
    versionHistory: (contract as any).versionHistory ?? [],
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
  // LECTURE: We keep PUT the same for now, as it's typically used for total resource replacement.
  // We will concentrate our version control logic on the PATCH route below.
  const { id } = await context.params;

  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exists = await getContractAndRole(id, clerkId);
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await connectDB();
  const body = await req.json();
  delete body.ownerId;

  if (body.contractContent) {
    body.ownerAgreed = false;
    body.partyBAgreed = false;
  }

  const internalId = exists.contract._id;
  const updated = await Contract.findByIdAndUpdate(internalId, body, { new: true });
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
  
  // Security: Ensure ownerId can't be patched by a bad actor
  delete body.ownerId;

  const internalId = exists.contract._id;
  
  // LECTURE: We fetch the currently saved document *before* we apply any updates. 
  // We need to compare the incoming text with the old text.
  const existingContract = await Contract.findById(internalId);
  if (!existingContract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // LECTURE: This is a complex Mongoose update object. We separate $set (replacing fields) 
  // from $push (adding an item to an array) so they execute simultaneously.
  const updateDoc: any = { $set: { ...body } };

  // LECTURE: The crucial version control & mutual exclusion check.
  if (body.contractContent && body.contractContent !== existingContract.contractContent) {
    
    // 1. Reset the "Handshake" flags
    updateDoc.$set.ownerAgreed = false;
    updateDoc.$set.partyBAgreed = false;
    
    // NEW: Shift the status to negotiation mode so both parties can participate
    updateDoc.$set.contractStatus = "in_negotiation"; 

    // 2. MUTUAL EXCLUSION: Pass the "pen" to the other party
    const isOwner = exists.role === "owner";
    updateDoc.$set.currentTurn = isOwner ? "partyB" : "owner";

    // 3. Create the snapshot of the OLD text
    updateDoc.$push = {
      versionHistory: {
        updatedBy: clerkId,
        updatedAt: new Date(),
        contentSnapshot: existingContract.contractContent,
        action: "proposed_edit"
      }
    };
  }

  // Also pass the pen if the owner is sending a draft for review
  if (body.contractStatus === "sent_for_review") {
      updateDoc.$set.currentTurn = "partyB";
  }

  // Also pass the pen if the owner is sending a draft for review
  if (body.contractStatus === "sent_for_review") {
      updateDoc.$set.currentTurn = "partyB";
  }

  // Execute the secure update
  const updated = await Contract.findByIdAndUpdate(
    internalId,
    updateDoc,
    { new: true } // Return the freshly updated document
  );

  return NextResponse.json(updated);
}