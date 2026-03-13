import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import { getContractAndRole } from "@/lib/contractAuth";

/**
 * POST /api/contracts/[id]/lock
 * ----------------------------
 * This route transitions the contract status to "locked".
 * Only the owner or a party with authority can lock the contract after negotiation.
 * Once locked, the content is permanent and signatures can be collected.
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

    // Only allow locking if in appropriate state
    const currentStatus = authResult.contract;
    const contractDoc = await Contract.findOne({ contractId: id });
    
    if (!contractDoc) {
       return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // You can only lock if it's in negotiation or sent for review
    const validStatuses = ["sent_for_review", "in_negotiation"];
    if (!validStatuses.includes(contractDoc.contractStatus)) {
      return NextResponse.json(
        { error: `Cannot lock contract in ${contractDoc.contractStatus} state.` },
        { status: 400 }
      );
    }

    await connectDB();
    contractDoc.contractStatus = "locked";
    await contractDoc.save();

    return NextResponse.json({
      success: true,
      message: "Contract locked successfully. It is now ready for signatures.",
      status: contractDoc.contractStatus,
    });
  } catch (error: any) {
    console.error("Lock Contract Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
