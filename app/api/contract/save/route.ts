import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// 1. Import your Models and Logic
import Contract from "@/db/models/Contract";
import User from "@/db/models/User";
import ClientProfile from "@/db/models/ClientProfile";
import ContractProfile from "@/db/models/ContractProfile";
import Financial from "@/db/models/Finance";
import { getContractLogic } from "@/lib/contract-templates/logic-registry";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // 2. Authenticate
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. Connect to DB
    await connectDB();

    const userDoc = await User.findOne({ clerkId: userId });
    let clientId = new mongoose.Types.ObjectId();
    let contractorId = new mongoose.Types.ObjectId();

    if (userDoc) {
      const clientProfile = await ClientProfile.findOne({ user: userDoc._id });
      const contractorProfile = await ContractProfile.findOne({ user: userDoc._id });

      if (clientProfile) clientId = clientProfile._id;
      if (contractorProfile) contractorId = contractorProfile._id;
    }

    // 3. Parse Request
    const { contractType, formData, selectedClauses } = await req.json();

    // IDENTITY CHECK: Ensure Party A and Party B are not the same person
    const partyAEmail = formData.PARTY_A_EMAIL?.toLowerCase().trim();
    const partyBEmail = formData.PARTY_B_EMAIL?.toLowerCase().trim();

    if (partyAEmail && partyBEmail) {
      if (partyAEmail === partyBEmail) {
        return NextResponse.json(
          { error: "Party A and Party B must have different email addresses." },
          { status: 400 }
        );
      }

      const { currentUser: getClerkUser } = await import("@clerk/nextjs/server");
      const clerkUser = await getClerkUser();
      const myEmails = clerkUser?.emailAddresses.map(e => e.emailAddress.toLowerCase().trim()) || [];
      
      // We only block if BOTH emails belong to the current user (truly inviting yourself)
      const isPartyAMine = myEmails.includes(partyAEmail);
      const isPartyBMine = myEmails.includes(partyBEmail);

      if (isPartyAMine && isPartyBMine) {
        return NextResponse.json(
          { error: "You cannot invite yourself as the counterparty. Both Party A and Party B emails are associated with your account." },
          { status: 400 }
        );
      }
    }

    // 5. Generate the "Clean" Contract Content
    const templateLogic = getContractLogic(contractType);

    // Validate first
    const validation = templateLogic.validate(formData);
    if (!validation.isValid) {
      return NextResponse.json({
        error: "Missing required fields",
        missing: validation.missingRequired
      }, { status: 400 });
    }

    const finalContent = templateLogic.generate({
      placeholderValues: formData,
      selectedOptionalClauses: selectedClauses,
      isDraft: true,
    });

    /**
     * 6. Resolve Relationships
     * Fallback to new ObjectIds if the user profiles aren't found
     */

    // 7. Create the Contract Document
    const newContract = await Contract.create({
      ownerId: userId,
      contractId: uuidv4(), 

      // Basic Info
      contractTitle: formData.AGREEMENT_TITLE,
      description: formData.SERVICE_DESCRIPTION ? formData.SERVICE_DESCRIPTION.slice(0, 150) + "..." : "",
      summary: `Agreement between ${formData.PARTY_A_NAME} and ${formData.PARTY_B_NAME}`,

      startDate: new Date(formData.START_DATE),
      deadline: new Date(formData.END_DATE),

      companyName: formData.PARTY_B_NAME || "", 
      companyLogoUrl: formData.COMPANY_LOGO || "",
      bgImageUrl: formData.BACKGROUND_IMAGE || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",

      // Relationships
      client: clientId,
      contractor: contractorId,
      partyB_Email: formData.PARTY_B_EMAIL, 

      // The Core Content
      contractContent: finalContent,
      contractType: contractType,
      contractStatus: "draft",
      progress: 0,

      // Metadata
      clauses: Object.values(selectedClauses || {}) as string[],
      keypoints: [
        `Service Location: ${formData.SERVICE_LOCATION}`,
        `Payment: ${formData.PAYMENT_AMOUNT} ${formData.PAYMENT_CURRENCY}`,
        `Notice Method: ${formData.NOTICE_METHOD}`
      ] as string[]
    });

    // ==========================================
    // PHASE 1: Auto-Generate Finance & Milestones
    // ==========================================
    const paymentAmount = parseFloat(formData.PAYMENT_AMOUNT) || 0;

    if (paymentAmount > 0) {
      let parsedMilestones: any[] = [];

      // Try to parse the Markdown table from Step 3
      if (formData.PAYMENT_SCHEDULE) {
        const lines = formData.PAYMENT_SCHEDULE.split("\n");
        for (const line of lines) {
          // Skip headers and empty lines
          if (line.includes("|") && !line.includes("---") && !line.includes("Date | Amount")) {
            const parts = line.split("|").map((p: string) => p.trim()).filter(Boolean);
            if (parts.length >= 2) {
              const dateRaw = parts[0];
              // Extract just the numbers from strings like "500.00 USD"
              const amountRaw = parseFloat(parts[1].replace(/[^0-9.]/g, '')) || 0;
              
              if (amountRaw > 0) {
                parsedMilestones.push({
                  title: `Installment due ${dateRaw}`,
                  amount: amountRaw,
                  dueDate: new Date(dateRaw),
                  isPaid: false
                });
              }
            }
          }
        }
      }

      // Fallback: If no schedule was created, make one lump-sum milestone
      if (parsedMilestones.length === 0) {
        parsedMilestones.push({
          title: "Full Contract Payment",
          amount: paymentAmount,
          dueDate: new Date(formData.END_DATE || Date.now()),
          isPaid: false
        });
      }

      // Create the Financial ledger in the database
      await Financial.create({
        financialId: uuidv4(),
        contract: newContract._id,
        client: clientId, 
        contractor: contractorId,
        totalAmount: paymentAmount,
        dueAmount: paymentAmount, // Initially, everything is due
        paidAmount: 0,
        currency: formData.PAYMENT_CURRENCY || "USD",
        paymentStatus: "not_started",
        milestones: parsedMilestones
      });
    }
    // ==========================================

    return NextResponse.json({
      success: true,
      contractId: newContract._id,
      message: "Contract saved successfully"
    });

  } catch (error: any) {
    console.error("Save Contract Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save" }, { status: 500 });
  }
}