import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import Financial from "@/db/models/Finance";
import User from "@/db/models/User";
import { getContractAndRole } from "@/lib/contractAuth";
import { generateUserNotifications } from "@/lib/notificationService";

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
  const { contract, role, userRoles } = result;

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
    counterpartyName,
  };

  // FETCH OWNER EMAIL
  const ownerUser = await User.findOne({ clerkId: (contract as any).ownerId });
  const finalContract = {
    ...formattedContract,
    ownerEmail: ownerUser?.email || "Unknown",
  };

  const finance = await Financial.findOne({ contract: contract._id });

  return NextResponse.json({ contract: finalContract, finance, role, userRoles });
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

  const existingContract = await Contract.findById(internalId);
  if (!existingContract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { finance, ...contractBody } = body;

  if (finance) {
    const paidAmt = finance.milestones?.filter((m: any) => m.isPaid).reduce((acc: number, m: any) => acc + Number(m.amount), 0) || 0;
    const totalAmt = Number(finance.totalAmount) || 0;
    const dueAmt = totalAmt - paidAmt;
    
    await Financial.findOneAndUpdate(
       { contract: internalId },
       {
           $set: {
               contract: internalId,
               client: existingContract.client,
               contractor: existingContract.contractor,
               financialId: `FIN-${internalId}`,
               totalAmount: totalAmt,
               currency: finance.currency || "USD",
               paidAmount: paidAmt,
               dueAmount: dueAmt,
               milestones: finance.milestones || []
           }
       },
       { upsert: true, new: true }
    );
  }

  // LECTURE: This is a complex Mongoose update object. We separate $set (replacing fields) 
  // from $push (adding an item to an array) so they execute simultaneously.
  const updateDoc: any = { $set: { ...contractBody } };

  // LECTURE: The crucial version control & mutual exclusion check.
  if (contractBody.contractContent && contractBody.contractContent !== existingContract.contractContent) {
    
    // 1. Reset the "Handshake" flags
    updateDoc.$set.ownerAgreed = false;
    updateDoc.$set.partyBAgreed = false;
    
    // NEW: Shift the status to negotiation mode ONLY if it is not already a draft
    // In draft mode, the owner retains the "pen" and the status stays as draft.
    if (existingContract.contractStatus !== "draft") {
        updateDoc.$set.contractStatus = "in_negotiation"; 
        // 2. MUTUAL EXCLUSION: Pass the "pen" to the other party
        const isOwner = exists.role === "owner";
        updateDoc.$set.currentTurn = isOwner ? "partyB" : "owner";
    }

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
  if (contractBody.contractStatus === "sent_for_review") {
      updateDoc.$set.currentTurn = "partyB";
  }

  // Execute the secure update
  const updated = await Contract.findByIdAndUpdate(
    internalId,
    updateDoc,
    { new: true } // Return the freshly updated document
  );

  // TRIGGER NOTIFICATIONS for both parties
  try {
    const UserModel = (await import("@/db/models/User")).default;
    const { generateUserNotifications } = await import("@/lib/notificationService");
    
    const ownerDoc = await UserModel.findOne({ clerkId: updated.ownerId });
    if (ownerDoc) await generateUserNotifications(ownerDoc._id as any);
    
    if (updated.partyB_ClerkId) {
        const partyBDoc = await UserModel.findOne({ clerkId: updated.partyB_ClerkId });
        if (partyBDoc) await generateUserNotifications(partyBDoc._id as any);
    }
  } catch (err) {
    console.error("Failed to trigger notifications after patch", err);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
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

  // Only the owner can delete, and only while it's a draft
  if (result.role !== "owner")
    return NextResponse.json({ error: "Only the owner can delete a draft" }, { status: 403 });

  if ((result.contract as any).contractStatus !== "draft")
    return NextResponse.json({ error: "Only draft contracts can be deleted" }, { status: 403 });

  await connectDB();
  const internalId = result.contract._id;

  // Delete associated financial record first
  await Financial.deleteOne({ contract: internalId });
  await Contract.findByIdAndDelete(internalId);

  return NextResponse.json({ success: true });
}