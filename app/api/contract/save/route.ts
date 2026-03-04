import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// 1. Import your Models and Logic
import Contract from "@/db/models/Contract";
// import ClientProfile from "@/db/models/ClientProfile"; // Uncomment if you have this
import { getContractLogic } from "@/lib/contract-templates/logic-registry";
import { connectDB } from "@/lib/db"; // ✅ FIX 1: Corrected import name

export async function POST(req: NextRequest) {
  try {
    // 2. Authenticate (✅ FIX 2: Added 'await')
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Parse Request
    const { contractType, formData, selectedClauses } = await req.json();

    // 4. Connect to DB
    await connectDB();

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
      isDraft: false,
    });

    /**
     * 6. Resolve Relationships
     * For now, we generate IDs. Later, replace this with a real ClientProfile lookup.
     */
    const clientId = new mongoose.Types.ObjectId();
    const contractorId = new mongoose.Types.ObjectId();

    // 7. Create the Contract Document
    // We map your Form Data to the exact Schema fields you shared
    const newContract = await Contract.create({
      ownerId: userId,
      contractId: uuidv4(), // Unique readable ID

      // Basic Info
      contractTitle: formData.AGREEMENT_TITLE,
      description: formData.SERVICE_DESCRIPTION ? formData.SERVICE_DESCRIPTION.slice(0, 150) + "..." : "",
      summary: `Agreement between ${formData.PARTY_A_NAME} and ${formData.PARTY_B_NAME}`,

      startDate: new Date(formData.START_DATE),
      deadline: new Date(formData.END_DATE),

      companyName: formData.PARTY_B_NAME, // "Other Company" name
      companyLogoUrl: "",
      bgImageUrl: "/images/contract-bg-default.jpg",

      // Relationships
      client: clientId,
      contractor: contractorId,

      // The Core Content
      contractContent: finalContent,
      contractType: contractType,
      contractStatus: "pending",
      progress: 0,

      // Metadata
      clauses: Object.values(selectedClauses || {}) as string[],
      keypoints: [
        `Service Location: ${formData.SERVICE_LOCATION}`,
        `Payment: ${formData.PAYMENT_AMOUNT} ${formData.PAYMENT_CURRENCY}`,
        `Notice Method: ${formData.NOTICE_METHOD}`
      ] as string[]
    });

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