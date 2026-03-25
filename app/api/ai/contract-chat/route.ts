import { NextRequest, NextResponse } from "next/server";
import { geminiChat } from "@/lib/gemini";
import Contract from "@/db/models/Contract";
import { connectDB } from "@/db/index";

export async function POST(req: NextRequest) {
  try {
    const { prompt, contractId } = await req.json();

    if (!prompt || !contractId) {
      return NextResponse.json({ error: "Missing prompt or contractId" }, { status: 400 });
    }

    await connectDB();
    const contract = await Contract.findOne({ contractId });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const context = `
Title: ${contract.contractTitle}
Description: ${contract.description || "N/A"}
Summary: ${contract.summary || "N/A"}
Content: ${contract.contractContent || "N/A"}
`.trim();

    const response = await geminiChat(prompt, context);

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Contract Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
