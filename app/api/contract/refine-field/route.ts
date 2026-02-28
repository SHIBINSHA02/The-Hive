import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient } from "@/lib/contract-templates/service-agreement/geminiClient";
import { aiFillPlaceholders } from "@/lib/contract-templates/service-agreement/aiFillPlaceholders";
import { isValidContractType } from "@/lib/contract-templates/registry";
import { PlaceholderKey } from "@/lib/contract-templates/service-agreement/placeholders";

export async function POST(req: NextRequest) {
  try {
    // 1. Extract data
    const body = await req.json();
    const { contractType, fieldKey, fieldValue } = body as {
      contractType: string;
      fieldKey: PlaceholderKey;
      fieldValue: string;
    };

    // Console Log for debugging
    console.log(`[AI Refine] Processing request for field: ${fieldKey}`);

    // 2. Validation
    if (!contractType || !fieldKey || !fieldValue) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (!isValidContractType(contractType)) {
      return NextResponse.json({ error: "Invalid contract type" }, { status: 400 });
    }

    // 3. Environment Variable Check (Crucial for avoiding 500 errors)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ [AI Refine] Critical Error: GEMINI_API_KEY is missing from .env file.");
      return NextResponse.json({ error: "Server configuration error: Missing API Key" }, { status: 500 });
    }

    // 4. Initialize Client
    const geminiClient = createGeminiClient(apiKey);

    // 5. Execute Refinement Logic
    // REMOVED 'model' property here because aiFillPlaceholders signature does not accept it.
    const refinedResult = await aiFillPlaceholders(geminiClient, {
      userValues: { [fieldKey]: fieldValue },
      keysToRefine: [fieldKey],
    });

    // 6. Extract result safely
    const refinedValue = refinedResult[fieldKey];

    if (!refinedValue) {
      console.warn(`[AI Refine] Refinement skipped or blocked for field: ${fieldKey}`);
      return NextResponse.json({ 
        error: "Refinement policy blocked this request or AI returned an empty result." 
      }, { status: 422 });
    }

    // 7. Success
    return NextResponse.json({ refinedValue });

  } catch (error: any) {
    console.error("🔥 [AI Refine] API Crash:", error.message);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during refinement." }, 
      { status: 500 }
    );
  }
}