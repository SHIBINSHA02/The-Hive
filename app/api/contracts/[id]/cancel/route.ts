import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import { getContractAndRole } from "@/lib/contractAuth";

/**
 * POST /api/contracts/[id]/cancel
 * ----------------------------
 * This route allows a party to "cancel" their agreement or for an owner to "cancel" a sent request.
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

    const { role, contract } = authResult;
    await connectDB();
    const contractDoc = await Contract.findById(authResult.contract._id);

    if (!contractDoc) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Protection: Active or Completed contracts cannot be cancelled/rescinded this way
    if (["active", "completed"].includes(contractDoc.contractStatus)) {
      return NextResponse.json(
        { error: `Cannot cancel contract in ${contractDoc.contractStatus} state.` },
        { status: 400 }
      );
    }

    let message = "";

    // LOGIC 1: Owner cancelling/discarding a contract (Draft or Sent)
    if (role === "owner" && ["draft", "sent_for_review", "in_negotiation"].includes(contractDoc.contractStatus) && !contractDoc.partyBAgreed) {
        contractDoc.contractStatus = "draft";
        contractDoc.ownerAgreed = false;
        contractDoc.partyBAgreed = false;
        contractDoc.ownerSigned = false;
        contractDoc.partyBSigned = false;
        message = "Contract request cancelled and moved back to draft.";
    } 
    // LOGIC 2: Rescinding personal agreement
    else {
        if (role === "owner") {
            if (!contractDoc.ownerAgreed) {
                return NextResponse.json({ error: "You have not agreed to this contract yet or it cannot be cancelled in this state." }, { status: 400 });
            }
            contractDoc.ownerAgreed = false;
            message = "Your agreement has been rescinded.";
        } else if (role === "partyB" || role === "client" || role === "contractor") {
            if (!contractDoc.partyBAgreed) {
                return NextResponse.json({ error: "You have not agreed to this contract yet." }, { status: 400 });
            }
            contractDoc.partyBAgreed = false;
            message = "Your agreement has been rescinded.";
        }

        // If it was locked, move it back to negotiation
        if (contractDoc.contractStatus === "locked") {
            contractDoc.contractStatus = "in_negotiation";
            contractDoc.ownerSigned = false; // Reset signature if agreement is pulled
            contractDoc.partyBSigned = false;
            message += " Contract unlocked for further negotiation.";
        }
    }

    await contractDoc.save();

    return NextResponse.json({
      success: true,
      message,
      status: contractDoc.contractStatus,
      ownerAgreed: contractDoc.ownerAgreed,
      partyBAgreed: contractDoc.partyBAgreed,
    });
  } catch (error: any) {
    console.error("Cancel Contract Action Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
