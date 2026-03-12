import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getContractLogic } from "@/lib/contract-templates/logic-registry";
import { getContractAndRole } from "@/lib/contractAuth";

/**
 * /api/contract/generate-pdf/route.ts
 * -----------------------------------
 * Final assembly route for PDF generation. 
 * POST: Takes fresh form data, validates it, and returns the legal text. (Used during Creation)
 * GET: Retrieves a saved contract from the database and returns the legal text. (Used in Dashboard)
 */

export async function POST(req: NextRequest) {
  try {
    const { contractType, formData, selectedClauses } = await req.json();

    // 1. Get Pure Logic (Safe for Server)
    // This avoids the "Client Component" error by using logic-registry
    const templateLogic = getContractLogic(contractType);

    // 2. Strict Legal Validation
    const validation = templateLogic.validate(formData);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: "Cannot generate PDF. Required fields are missing.",
        missing: validation.missingRequired 
      }, { status: 422 });
    }

    // 3. Assemble the Final Legal String
    const finalLegalText = templateLogic.generate({
      placeholderValues: formData,
      selectedOptionalClauses: selectedClauses,
      isDraft: false, // NO BRACKETS in the final PDF
    });

    // 4. Return the data for the PDF generator
    return NextResponse.json({ 
      fullText: finalLegalText,
      title: formData.AGREEMENT_TITLE || "Service Agreement",
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("PDF Prep Error:", error.message);
    
    return NextResponse.json(
      { error: error.message || "Failed to assemble contract" }, 
      { status: 500 }
    );
  }
}

/**
 * GET Method
 * ----------
 * Fetches an existing contract securely using the ContractAuth gatekeeper
 * and returns the exact same data structure as the POST method so the 
 * frontend PDF generator can process it identically.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Extract the contractId from the URL (e.g., ?contractId=123)
    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");

    if (!contractId) {
      return NextResponse.json({ error: "Contract ID is required" }, { status: 400 });
    }

    // 2. Authenticate the user securely
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Fetch the contract using your established Auth Gatekeeper
    // This ensures users can only download contracts they are a party to
    const result = await getContractAndRole(contractId, clerkId);
    
    if (!result) {
      return NextResponse.json({ error: "Contract not found or access denied" }, { status: 404 });
    }

    const { contract } = result;

    // 4. Return the identical structure expected by the frontend
    // We cast to `any` defensively because seed data might have a different shape
    return NextResponse.json({
      fullText: (contract as any).contractContent || "",
      title: (contract as any).contractTitle || "Legal Agreement",
      generatedAt: (contract as any).createdAt || new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Dashboard PDF Fetch Error:", error.message);
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch contract for download" }, 
      { status: 500 }
    );
  }
}