import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Financial from "@/db/models/Finance";
import Contract from "@/db/models/Contract";

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

    const { milestoneIndex } = await req.json();

    if (milestoneIndex === undefined || milestoneIndex === null) {
      return NextResponse.json({ error: "Milestone index is required" }, { status: 400 });
    }

    await connectDB();

    // 1. Find the Contract first to ensure it exists and get its internal _id
    const mongoose = require("mongoose");
    const idFilter = mongoose.Types.ObjectId.isValid(id) 
      ? { $or: [{ _id: id }, { contractId: id }] }
      : { contractId: id };
      
    const contractDoc = await Contract.findOne(idFilter);
    if (!contractDoc) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // THE FIX: Prevent payment on unsigned contracts
    // ==========================================
    if (contractDoc.contractStatus !== "active") {
      return NextResponse.json({ 
        error: "Cannot process payments. Contract must be fully signed and active." 
      }, { status: 400 });
    }
    
    // 2. Find the associated Finance document
    const financeDoc = await Financial.findOne({ contract: contractDoc._id });
    if (!financeDoc) {
      return NextResponse.json({ error: "Financial ledger not found" }, { status: 404 });
    }

    // 3. Ensure the milestone exists and isn't already paid
    if (!financeDoc.milestones[milestoneIndex]) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }
    
    if (financeDoc.milestones[milestoneIndex].isPaid) {
      return NextResponse.json({ error: "Milestone is already paid" }, { status: 400 });
    }

    // 4. Update the specific milestone
    financeDoc.milestones[milestoneIndex].isPaid = true;

    // 5. Recalculate totals
    const newlyPaidAmount = financeDoc.milestones[milestoneIndex].amount;
    financeDoc.paidAmount += newlyPaidAmount;
    financeDoc.dueAmount -= newlyPaidAmount;

    // Safety net against floating point weirdness
    if (financeDoc.dueAmount < 0) financeDoc.dueAmount = 0;

    // 6. Determine overall status
    if (financeDoc.paidAmount >= financeDoc.totalAmount) {
      financeDoc.paymentStatus = "completed";
    } else if (financeDoc.paidAmount > 0) {
      financeDoc.paymentStatus = "partial";
    } else {
      financeDoc.paymentStatus = "in_progress";
    }

    financeDoc.lastPaymentDate = new Date();

    // 7. Save to database
    await financeDoc.save();

    return NextResponse.json(financeDoc);

  } catch (error: any) {
    console.error("Finance Payment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}