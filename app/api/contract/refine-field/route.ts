import { NextRequest, NextResponse } from "next/server";
import { getContractLogic } from "@/lib/contract-templates/logic-registry";
import { createGeminiClient } from "@/lib/contract-templates/service-agreement/geminiClient"; 

export async function POST(req: NextRequest) {
  try {
    // 1. Extract data dynamically
    const body = await req.json();
    const { contractType, fieldKey, fieldValue } = body as {
      contractType: string;
      fieldKey: string; 
      fieldValue: string;
    };

    console.log(`[AI Refine] Processing request for field: ${fieldKey} on ${contractType}`);

    if (!contractType || !fieldKey || !fieldValue) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 2. Fetch the correct logic module for this contract type
    let templateLogic;
    try {
      templateLogic = getContractLogic(contractType);
    } catch (e) {
      return NextResponse.json({ error: "Invalid contract type" }, { status: 400 });
    }

    // 3. Environment Variable Check
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ [AI Refine] Critical Error: GEMINI_API_KEY is missing from .env file.");
      return NextResponse.json({ error: "Server configuration error: Missing API Key" }, { status: 500 });
    }

    // Initialize Client (Assuming you keep the client logic centralized)
    const geminiClient = createGeminiClient(apiKey);

    // 4. Execute the dynamic AI logic mapped from the registry
    const refinedResult = await templateLogic.aiFill(geminiClient, {
      userValues: { [fieldKey]: fieldValue },
      keysToRefine: [fieldKey],
    });

    const refinedValue = refinedResult[fieldKey];

    if (!refinedValue) {
      console.warn(`[AI Refine] Refinement skipped or blocked for field: ${fieldKey}`);
      return NextResponse.json({ 
        error: "Refinement policy blocked this request or AI returned an empty result." 
      }, { status: 422 });
    }

    // 5. Success
    return NextResponse.json({ refinedValue });

  } catch (error: any) {
    console.error("🔥 [AI Refine] API Crash:", error.message);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during refinement." }, 
      { status: 500 }
    );
  }
}