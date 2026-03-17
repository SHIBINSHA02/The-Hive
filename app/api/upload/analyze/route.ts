import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import RiskReport from "@/db/models/RiskReport";
import { extractText, getDocumentProxy } from "unpdf";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // 1. Convert file to Uint8Array (which unpdf prefers)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    let extractedText = "";
    if (file.name.endsWith(".pdf")) {
      // 2. The clean, modern way to extract text
      const pdf = await getDocumentProxy(buffer);
      const { text } = await extractText(pdf, { mergePages: true });
      
      // If text is returned as an array of strings, join it. Otherwise, use it directly.
      extractedText = Array.isArray(text) ? text.join("\n\n") : text;
      
    } else if (file.name.endsWith(".txt")) {
      extractedText = Buffer.from(arrayBuffer).toString("utf-8");
    } else {
      return NextResponse.json({ error: "Please upload a PDF or TXT file." }, { status: 400 });
    }

    // ==========================================
    // TEAMMATE: CALL YOUR FLASK/PYTHON ML MODEL HERE
    // ==========================================

    const mockRisks = [
      { 
        clause: "Termination for Convenience", 
        issue: "Either party can terminate with only 5 days notice, leaving you vulnerable to sudden cancellation.", 
        suggestion: "Increase notice period to 30 or 60 days.", 
        severity: "high" 
      },
      { 
        clause: "Liability Cap", 
        issue: "Liability is not expressly capped at the total contract value.", 
        suggestion: "Add a clause limiting maximum liability to the total fees paid under this agreement.", 
        severity: "medium" 
      }
    ];

    const newReport = await RiskReport.create({
      userId,
      fileName: file.name,
      extractedText,
      riskScore: 65,
      risks: mockRisks
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (err: any) {
    console.error("Analysis Error:", err);
    return NextResponse.json({ error: "Analysis failed", details: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const history = await RiskReport.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(history);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}