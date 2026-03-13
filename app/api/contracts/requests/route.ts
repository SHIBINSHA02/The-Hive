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
    
    // 2. Extract the user's primary email address from the Clerk object
    const userEmail = user.emailAddresses.find(
      (emailObj) => emailObj.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "No primary email found for user" }, { status: 400 });
    }

    await connectDB();

    // 3. FETCH INBOX (Received Requests)
    // Find contracts where this user's email matches partyB_Email AND it is currently in the negotiation loop.
    const receivedRequests = await Contract.find({
      partyB_Email: userEmail.toLowerCase().trim(),
      contractStatus: { $in: ["sent_for_review", "in_negotiation"] }
    }).sort({ updatedAt: -1 }); // Sort by newest first

    // 4. FETCH OUTBOX (Sent Requests)
    // Find contracts where this user is the owner AND they have sent it out for review.
    const sentRequests = await Contract.find({
      ownerId: clerkId,
      contractStatus: { $in: ["draft", "sent_for_review", "in_negotiation"] }
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