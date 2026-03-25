import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import { getContractAndRole } from "@/lib/contractAuth";

/**
 * POST /api/contracts/[id]/reject
 * ----------------------------
 * This route allows a party to "reject" the current proposal or withdraw agreement.
 * It resets agreement flags, toggles the turn if needed, and records a rejection in history.
 */
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

    const authResult = await getContractAndRole(id, clerkId);
    if (!authResult) {
      return NextResponse.json({ error: "Contract not found or access denied" }, { status: 404 });
    }

    const { role } = authResult;
    await connectDB();
    const contractDoc = await Contract.findById(authResult.contract._id);

    if (!contractDoc) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Protection: Active or Completed contracts cannot be rejected this way
    if (["active", "completed"].includes(contractDoc.contractStatus)) {
      return NextResponse.json(
        { error: `Cannot reject contract in ${contractDoc.contractStatus} state.` },
        { status: 400 }
      );
    }

    // Reset agreement flags
    contractDoc.ownerAgreed = false;
    contractDoc.partyBAgreed = false;
    contractDoc.ownerSigned = false;
    contractDoc.partyBSigned = false;

    // Shift turn to the person who rejected (so they can immediately make changes/notes)
    // Or shift it to the OTHER person? 
    // Usually, if I reject, I want to say WHY and maybe edit.
    // If it's NOT my turn and I reject, I'm pulling the turn back.
    contractDoc.currentTurn = role === "owner" ? "owner" : "partyB";

    // Revert status if it was locked
    if (contractDoc.contractStatus === "locked") {
      contractDoc.contractStatus = "in_negotiation";
    }

    // Record the rejection in history
    contractDoc.versionHistory.push({
      updatedBy: clerkId,
      updatedAt: new Date(),
      contentSnapshot: contractDoc.contractContent || "",
      action: "reverted" 
    });

    await contractDoc.save();

    return NextResponse.json({
      success: true,
      message: "Proposal rejected and agreement rescinded. It is now your turn.",
      status: contractDoc.contractStatus,
      currentTurn: contractDoc.currentTurn,
    });
  } catch (error: any) {
    console.error("Reject Contract Action Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
