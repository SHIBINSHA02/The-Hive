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

    // Import models dynamically to avoid circular dependencies if any
    const UserModel = (await import("@/db/models/User")).default;
    const ClientProfile = (await import("@/db/models/ClientProfile")).default;
    const ContractProfile = (await import("@/db/models/ContractProfile")).default;

    const userDoc = await UserModel.findOne({ clerkId });
    if (!userDoc) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

    // Get user's profile links
    const clientProfile = await ClientProfile.findOne({ user: userDoc._id });
    const contractorProfile = await ContractProfile.findOne({ user: userDoc._id });

    // 3. FETCH INBOX (Received Requests - things I need to act on)
    const inboxConditions: any[] = [
      { partyB_Email: { $in: userEmails } },
      { partyB_ClerkId: clerkId }
    ];
    if (clientProfile) inboxConditions.push({ client: clientProfile._id, ownerId: { $ne: clerkId } });
    if (contractorProfile) inboxConditions.push({ contractor: contractorProfile._id, ownerId: { $ne: clerkId } });

    const receivedRequests = await Contract.find({
      $or: inboxConditions,
      contractStatus: { $in: ["sent_for_review", "in_negotiation", "locked"] }
    })
    .populate("client")
    .populate("contractor")
    .sort({ updatedAt: -1 });

    // 4. FETCH OUTBOX (Sent Requests & Drafts)
    const sentRequests = await Contract.find({
      ownerId: clerkId,
      contractStatus: { $in: ["draft", "sent_for_review", "in_negotiation", "locked"] }
    })
    .populate("client")
    .populate("contractor")
    .sort({ updatedAt: -1 });

    // 5. Format the results to match the main Contracts API standard
    const format = (c: any) => ({
      _id: c._id.toString(),
      contractId: c.contractId,
      contractTitle: c.contractTitle || "Untitled Contract",
      companyName: c.companyName || "Unknown Entity",
      companyLogoUrl: c.companyLogoUrl,
      bgImageUrl: c.bgImageUrl,
      description: c.description,
      summary: c.summary,
      startDate: c.startDate ? new Date(c.startDate).toISOString() : new Date().toISOString(),
      deadline: c.deadline ? new Date(c.deadline).toISOString() : new Date().toISOString(),
      progress: c.progress || 0,
      contractStatus: c.contractStatus || "draft", // Guard against missing status
      ownerId: c.ownerId,
      partyB_Email: c.partyB_Email,
      partyB_ClerkId: c.partyB_ClerkId,
      clientName: c.client?.name,
      contractorName: c.contractor?.name,
    });

    return NextResponse.json({
      received: receivedRequests.map(format),
      sent: sentRequests.map(format)
    });

  } catch (error: any) {
    console.error("Fetch Requests Error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}