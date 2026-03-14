import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import { getContractAndRole } from "@/lib/contractAuth";

/**
 * /api/contracts/[id]/invite/route.ts
 * -----------------------------------
 * This route acts as the trigger for Phase 2: Negotiation.
 * It takes an email address from Party A, attaches it to the contract,
 * and advances the State Machine to "sent_for_review".
 */

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await params (Next.js 15+ requirement)
    const { id } = await context.params;

    // 2. Authentication: Ensure the user is logged in
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Extract the email from the frontend payload
    const body = await req.json();
    const { email: invitedEmail } = body;

    if (!invitedEmail || !invitedEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // IDENTITY CHECK: Ensure Party A and Party B are different people
    const { currentUser: getClerkUser } = await import("@clerk/nextjs/server");
    const user = await getClerkUser();
    const myEmails = user?.emailAddresses.map(e => e.emailAddress.toLowerCase().trim()) || [];
    if (myEmails.includes(invitedEmail.toLowerCase().trim())) {
      return NextResponse.json(
        { error: "You cannot invite yourself as the counterparty. Party A and Party B must be different people." },
        { status: 400 }
      );
    }

    // 4. Authorization via Gatekeeper
    // We check if the contract exists AND what role this user plays.
    const exists = await getContractAndRole(id, clerkId);
    if (!exists) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // SECURITY CHECK: Only the "owner" (Party A) can initiate an invite.
    // If Party B somehow triggered this route, block them.
    if (exists.role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden. Only the contract owner can send invites." },
        { status: 403 }
      );
    }

    // 5. Connect to the database
    await connectDB();

    // 6. Execute the State Machine Transition
    // We update the target email and flip the status.
    const updatedContract = await Contract.findOneAndUpdate(
      { contractId: id },
      {
        $set: {
          partyB_Email: invitedEmail.toLowerCase().trim(),
          contractStatus: "sent_for_review",
          ownerAgreed: true, // The creator agrees upon sending
        },
      },
      { new: true } // Returns the modified document
    );

    if (!updatedContract) {
      return NextResponse.json({ error: "Failed to update contract" }, { status: 500 });
    }

    // 7. (Optional Future Step) Send actual email via Resend/SendGrid here!
    // await sendInviteEmail(email, updatedContract.contractTitle, ...);

    return NextResponse.json({
      message: "Invitation sent successfully",
      status: updatedContract.contractStatus,
      partyB_Email: updatedContract.partyB_Email,
    });

  } catch (error: any) {
    console.error("Invite Error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}