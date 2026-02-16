import { NextRequest, NextResponse } from "next/server";
import { isValidContractType, getContractTemplate } from "@/lib/contract-templates/registry";

/**
 * /api/contract/generate-pdf/route.ts
 * -----------------------------------
 * Final assembly route. Takes the form data, validates it one last time,
 * and returns the final legal text for PDF rendering.
 */

export async function POST(req: NextRequest) {
  try {
    const { contractType, formData, selectedClauses } = await req.json();

    // 1. Validation Logic
    if (!isValidContractType(contractType)) {
      return NextResponse.json({ error: "Invalid contract type" }, { status: 400 });
    }

    const template = getContractTemplate(contractType);

    // 2. Strict Legal Validation (isDraft: false)
    // This ensures we aren't generating a PDF with [MISSING DATA] tags.
    const validation = template.validatePlaceholders(formData);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: "Cannot generate PDF. Required fields are missing.",
        missing: validation.missingRequired 
      }, { status: 422 });
    }

    // 3. Assemble the Final Legal String
    const finalLegalText = template.generateContract({
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
    return NextResponse.json({ error: "Failed to assemble contract" }, { status: 500 });
  }
}