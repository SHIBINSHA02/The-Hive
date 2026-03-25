import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import Notification from "@/db/models/Notification";
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

    // 1. Transition status to terminated
    // 2. Clear partyB details for Party B (so it's removed from their view)
    // 3. Reset agreement flags
    const updateData: any = {
      contractStatus: "terminated",
      ownerAgreed: false,
      partyBAgreed: false,
    };

    // If Party B terminates, they should be "unlinked" from the contract view-wise
    if (role === "partyB") {
        updateData.partyB_ClerkId = null;
        updateData.partyB_Email = null;
    }

    const updatedContract = await Contract.findByIdAndUpdate(
      contract._id,
      { $set: updateData },
      { new: true }
    );

    // TRIGGER NOTIFICATIONS
    try {
        const ownerDoc = await User.findOne({ clerkId: contract.ownerId });
        if (ownerDoc) await generateUserNotifications(ownerDoc._id as any);
    } catch (err) {
        console.error("Failed to trigger notifications after termination", err);
    }

    return NextResponse.json({
      message: "Negotiation terminated successfully",
      status: updatedContract?.contractStatus,
    });
  } catch (error: any) {
    console.error("Terminate Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
