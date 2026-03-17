import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import { getContractAndRole } from "@/lib/contractAuth";

/**
 * POST /api/contracts/[id]/sign
 * ----------------------------
 * This route records a digital signature for the current viewer.
 * Only allowed if the contract status is "locked".
 * If both owner and partyB sign, status moves to "active".
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

    if (contractDoc.contractStatus !== "locked") {
      return NextResponse.json(
        { error: "Contract must be locked before signing." },
        { status: 400 }
      );
    }

    const nowStr = new Date().toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (role === "owner") {
      return NextResponse.json({ error: "Owner has already signed by locking the contract." }, { status: 400 });
    } else if (role === "partyB" || role === "client" || role === "contractor") {
      // Mapping other roles to partyBSigned
      contractDoc.partyBSigned = true;
      const sigText = `DIGITALLY SIGNED by ${clerkId} (Party B) on ${nowStr}`;
      contractDoc.contractContent = (contractDoc.contractContent || "")
        .replace("{{PARTY_B_SIGNATURE}}", sigText)
        .replace("_______________________", sigText); // Fallback
    } else {
      return NextResponse.json({ error: "Unauthorized role for signing" }, { status: 403 });
    }

    // SAFETY NET: If the contract made it to the locked stage, the owner has inherently 
    // signed/approved it. We force this to true just in case the locking route missed it.
    contractDoc.ownerSigned = true;
    
    // Since the owner signed during locking, and Party B just signed:
    if (contractDoc.ownerSigned && contractDoc.partyBSigned) {
      contractDoc.contractStatus = "active";
      contractDoc.progress = 100;
    }

    await contractDoc.save();

    return NextResponse.json({
      success: true,
      message: "Contract signed successfully.",
      status: contractDoc.contractStatus,
      ownerSigned: contractDoc.ownerSigned,
      partyBSigned: contractDoc.partyBSigned,
    });
  } catch (error: any) {
    console.error("Sign Contract Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
