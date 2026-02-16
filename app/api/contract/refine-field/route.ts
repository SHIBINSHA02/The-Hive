import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient } from "@/lib/contract-templates/service-agreement/geminiClient";
import { aiFillPlaceholders } from "@/lib/contract-templates/service-agreement/aiFillPlaceholders";
import { isValidContractType } from "@/lib/contract-templates/registry";
import { PlaceholderKey } from "@/lib/contract-templates/service-agreement/placeholders";

/**
 * /api/contract/refine-field/route.ts
 * ----------------------------------
 * The bridge between the UI "Sparkle" buttons and the Gemini AI engine.
 */

export async function POST(req: NextRequest) {
  try {
    // 1. Extract data from the request
    const body = await req.json();
    const { contractType, fieldKey, fieldValue } = body as {
      contractType: string;
      fieldKey: PlaceholderKey;
      fieldValue: string;
    };

    // 2. Initial Security & Sanity Checks
    if (!contractType || !fieldKey || !fieldValue) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (!isValidContractType(contractType)) {
      return NextResponse.json({ error: "Invalid contract type" }, { status: 400 });
    }

    // 3. Initialize the AI Infrastructure
    // Note: ensure GEMINI_API_KEY is defined in your .env
    const geminiClient = createGeminiClient(process.env.GEMINI_API_KEY || "");

    /**
     * 4. Execute the AI Refinement Logic
     * This single line triggers a cascade of safety checks:
     * - Checks aiPermissions.ts to see if this field is allowed to be AI-refined.
     * - Checks if the field is empty (to prevent AI "hallucinations").
     * - Generates the prompt using the field-specific context.
     * - Parses the JSON response from Gemini 1.5 Pro.
     */
    const refinedResult = await aiFillPlaceholders(geminiClient, {
      userValues: { [fieldKey]: fieldValue },
      keysToRefine: [fieldKey],
    });

    // 5. Handle cases where refinement was skipped by the logic layer
    const refinedValue = refinedResult[fieldKey];

    if (!refinedValue) {
      return NextResponse.json({ 
        error: "Refinement policy blocked this request or AI returned an empty result." 
      }, { status: 422 });
    }

    // 6. Success! Return the professionally phrased text.
    return NextResponse.json({ refinedValue });

  } catch (error: any) {
    console.error("AI Refinement API Error:", error.message);
    
    // Return a graceful error message to the UI
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during refinement." }, 
      { status: 500 }
    );
  }
}