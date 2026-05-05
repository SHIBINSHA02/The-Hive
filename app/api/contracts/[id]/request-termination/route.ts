import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import User from "@/db/models/User";
import { getContractAndRole } from "@/lib/contractAuth";
import { generateUserNotifications } from "@/lib/notificationService";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getContractAndRole(id, clerkId);
    if (!result) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const { contract, role } = result;

    await connectDB();

    const isOwner = role === "owner";
    const isPartyB = role === "partyB";

    if (!isOwner && !isPartyB) {
      return NextResponse.json({ error: "Unauthorized role for mutual termination" }, { status: 403 });
    }

    let updateData: any = {};
    
    if (isOwner) {
      updateData.ownerRequestedTermination = true;
    } else if (isPartyB) {
      updateData.partyBRequestedTermination = true;
    }

    // Check if the other party has already requested termination
    const otherRequested = isOwner ? (contract as any).partyBRequestedTermination : (contract as any).ownerRequestedTermination;

    if (otherRequested) {
      updateData.contractStatus = "terminated";
    }

    const updatedContract = await Contract.findByIdAndUpdate(
      contract._id,
      { $set: updateData },
      { new: true, strict: false }
    );

    // TRIGGER NOTIFICATIONS
    try {
      const ownerDoc = await User.findOne({ clerkId: contract.ownerId });
      if (ownerDoc) await generateUserNotifications(ownerDoc._id as any);

      if (contract.partyB_ClerkId) {
        const partyBDoc = await User.findOne({ clerkId: contract.partyB_ClerkId });
        if (partyBDoc) await generateUserNotifications(partyBDoc._id as any);
      }
    } catch (err) {
      console.error("Failed to trigger notifications after mutual termination request", err);
    }

    return NextResponse.json({
      message: otherRequested ? "Contract mutually terminated" : "Termination requested",
      contract: updatedContract,
    });
  } catch (error: any) {
    console.error("Mutual Terminate Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
