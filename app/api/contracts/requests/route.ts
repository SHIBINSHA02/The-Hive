import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";

/**
 * /api/contracts/requests/route.ts
 * --------------------------------
 * This route fetches the data for the Negotiation Dashboard.
 * It returns two arrays: 
 * 1. received: Contracts sent TO the logged-in user.
 * 2. sent: Contracts sent BY the logged-in user.
 */

export async function GET() {
  try {
    // 1. Get the full user object from Clerk. 
    // We need this (instead of just auth()) to get the user's actual email address.
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkId = user.id;
    
    // 2. Extract all email addresses from the Clerk object
    const userEmails = user.emailAddresses.map(e => e.emailAddress.toLowerCase().trim());

    if (userEmails.length === 0) {
      return NextResponse.json({ error: "No email found for user" }, { status: 400 });
    }

    await connectDB();

    // 3. FETCH INBOX (Received Requests)
    // Find contracts where any of this user's emails matches partyB_Email AND it is currently in the negotiation loop.
    const receivedRequests = await Contract.find({
      partyB_Email: { $in: userEmails },
      contractStatus: { $in: ["sent_for_review", "in_negotiation", "locked"] }
    }).sort({ updatedAt: -1 }); // Sort by newest first

    // 4. FETCH OUTBOX (Sent Requests & Drafts)
    // Find contracts where this user is the owner AND they are still in draft/negotiation/locked phases.
    const sentRequests = await Contract.find({
      ownerId: clerkId,
      contractStatus: { $in: ["draft", "sent_for_review", "in_negotiation", "locked"] }
    }).sort({ updatedAt: -1 });

    // 5. Return both arrays to the frontend
    return NextResponse.json({
      received: receivedRequests,
      sent: sentRequests
    });

  } catch (error: any) {
    console.error("Fetch Requests Error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}