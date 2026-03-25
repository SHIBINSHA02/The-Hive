import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/db/index";
import Contract from "@/db/models/Contract";
import { getGeminiEmbedding } from "@/lib/gemini";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: contractId } = await params;
    await connectDB();

    const contract = await Contract.findOne({ contractId });
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const textToEmbed = `
      Title: ${contract.contractTitle}
      Company: ${contract.companyName}
      Summary: ${contract.summary || ""}
      Keypoints: ${contract.keypoints?.join(", ") || ""}
      Content: ${contract.contractContent || ""}
    `.trim();

    const newEmbedding = await getGeminiEmbedding(textToEmbed);

    await Contract.updateOne(
      { contractId },
      { $set: { embeddings: newEmbedding } }
    );

    return NextResponse.json({ success: true, dimensions: newEmbedding.length });
  } catch (error: any) {
    console.error("Re-embed Error:", error);
    return NextResponse.json({ error: "Failed to re-embed contract" }, { status: 500 });
  }
}
