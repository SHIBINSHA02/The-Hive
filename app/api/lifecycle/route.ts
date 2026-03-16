// app/api/lifecycle/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/db/models/User";
import Contract from "@/db/models/Contract";
import Financial from "@/db/models/Finance";

export async function GET() {
  try {
    await connectDB();
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ clerkId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userEmails = user.email ? [user.email.toLowerCase().trim()] : [];

    // 1. Fetch ALL contracts involving this user
    const contracts = await Contract.find({
      $or: [
        { ownerId: clerkId },
        { partyB_ClerkId: clerkId },
        { partyB_Email: { $in: userEmails } }
      ]
    }).lean();

    const contractIds = contracts.map(c => c._id);

    // 2. Fetch all related financial records
    const finances = await Financial.find({ contract: { $in: contractIds } }).lean();

    // 3. Initialize our buckets and stats
    const stats = {
      pipelineValue: 0,
      activeContracts: 0,
      urgentAlerts: 0,
      overduePayments: 0
    };

    const deadlines: any[] = [];
    const delayed: any[] = [];
    const upcoming: any[] = [];

    const today = new Date();

    // 4. Process and categorize each contract
    contracts.forEach((contract: any) => {
      const finance = finances.find((f: any) => f.contract.toString() === contract._id.toString());
      
      // Update Stats
      if (contract.contractStatus === "active") stats.activeContracts++;
      if (finance && finance.totalAmount) stats.pipelineValue += finance.totalAmount;

      const deadlineDate = new Date(contract.deadline);
      const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      const isOwner = contract.ownerId === clerkId;
      const counterpartyEmail = isOwner ? contract.partyB_Email : user.email;

      const mappedContract = {
        id: contract.contractId || contract._id.toString(),
        clientName: contract.companyName || "Unknown Entity",
        contractTitle: contract.contractTitle || "Untitled Contract",
        deadline: deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: finance ? new Intl.NumberFormat('en-US', { style: 'currency', currency: finance.currency || 'USD' }).format(finance.totalAmount) : "$0.00",
        status: "normal",
        email: counterpartyEmail || "No email",
        category: "deadline"
      };

      // Financial Logic (Delayed vs Upcoming)
      if (finance && finance.dueAmount > 0) {
          // Simplistic logic: if contract is active but not fully paid and deadline passed
          if (daysUntilDeadline < 0) {
              mappedContract.status = "overdue";
              mappedContract.category = "delayed";
              stats.overduePayments++;
              delayed.push(mappedContract);
          } else if (daysUntilDeadline <= 14) {
              mappedContract.status = "urgent";
              mappedContract.category = "payment";
              upcoming.push(mappedContract);
          }
      }

      // Deadline Logic (Urgent vs Warning)
      if (contract.contractStatus !== "completed" && mappedContract.category === "deadline") {
          if (daysUntilDeadline < 0) {
              mappedContract.status = "urgent";
              stats.urgentAlerts++;
              deadlines.push(mappedContract);
          } else if (daysUntilDeadline <= 7) {
              mappedContract.status = "urgent";
              stats.urgentAlerts++;
              deadlines.push(mappedContract);
          } else if (daysUntilDeadline <= 30) {
              mappedContract.status = "warning";
              deadlines.push(mappedContract);
          }
      }
    });

    // Format pipeline value nicely (e.g., $1.2M, $45K)
    let formattedPipeline = "$0";
    if (stats.pipelineValue >= 1000000) {
        formattedPipeline = `$${(stats.pipelineValue / 1000000).toFixed(1)}M`;
    } else if (stats.pipelineValue >= 1000) {
        formattedPipeline = `$${(stats.pipelineValue / 1000).toFixed(1)}K`;
    } else {
        formattedPipeline = `$${stats.pipelineValue}`;
    }

    return NextResponse.json({
        stats: { ...stats, formattedPipeline },
        deadlines: deadlines.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
        delayed,
        upcoming
    });

  } catch (err: any) {
    console.error("Lifecycle API Error:", err);
    return NextResponse.json({ error: "Failed to fetch lifecycle data" }, { status: 500 });
  }
}