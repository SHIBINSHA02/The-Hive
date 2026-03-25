import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import { getContractAndRole } from "@/lib/contractAuth";

/**
 * POST /api/contracts/[id]/agree
 * ----------------------------
 * This route allows a party to agree to the current contract content.
 * When BOTH parties agree, the status automatically moves to "locked".
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
    const contractDoc = await Contract.findOne({ contractId: id });

    if (!contractDoc) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Only allow agreement if not already locked/active
    const validStatuses = ["sent_for_review", "in_negotiation"];
    if (!validStatuses.includes(contractDoc.contractStatus)) {
      return NextResponse.json(
        { error: `Cannot agree to contract in ${contractDoc.contractStatus} state.` },
        { status: 400 }
      );
    }

    if (role === "owner") {
      contractDoc.ownerAgreed = true;
    } else if (role === "partyB" || role === "client" || role === "contractor") {
      contractDoc.partyBAgreed = true;
    } else {
      return NextResponse.json({ error: "Unauthorized role for agreement" }, { status: 403 });
    }

    // ==========================================
    // THE FIX: State Machine Transition
    // ==========================================
    // If both parties have now agreed, lock the contract for signatures.
    if (contractDoc.ownerAgreed && contractDoc.partyBAgreed) {
      contractDoc.contractStatus = "locked";
      
      // LECTURE: SAVE THE FINAL AGREED VERSION SNAPSHOT
      // This ensures we have a permanent record of what both parties exactly signed off on.
      contractDoc.versionHistory.push({
        updatedBy: "SYSTEM_AGREEMENT", // Or clerkId if we want to attribute to the final clicker
        updatedAt: new Date(),
        contentSnapshot: contractDoc.contractContent || "",
        action: "accepted"
      });
    }

    await contractDoc.save();

    return NextResponse.json({
      success: true,
      message: "Agreement recorded successfully.",
      status: contractDoc.contractStatus,
      ownerAgreed: contractDoc.ownerAgreed,
      partyBAgreed: contractDoc.partyBAgreed,
    });
  } catch (error: any) {
    console.error("Agree Contract Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}