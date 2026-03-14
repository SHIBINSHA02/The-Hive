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

    // Only the owner can lock the contract
    if (authResult.role !== "owner") {
      return NextResponse.json({ error: "Only the contract owner can lock the contract." }, { status: 403 });
    }

    // Ensure the counterparty has agreed before locking (optional but good practice)
    if (!contractDoc.partyBAgreed) {
      return NextResponse.json({ error: "Cannot lock until the other party has agreed to the terms." }, { status: 400 });
    }

    const nowStr = new Date().toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    await connectDB();
    contractDoc.contractStatus = "locked";
    contractDoc.ownerSigned = true;

    // Creator's locking acts as their signature
    const sigText = `DIGITALLY SIGNED by ${clerkId} (Owner) on ${nowStr}`;
    contractDoc.contractContent = (contractDoc.contractContent || "")
      .replace("{{PARTY_A_SIGNATURE}}", sigText)
      .replace("_______________________", sigText); // Fallback

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
