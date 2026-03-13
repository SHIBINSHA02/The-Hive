import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import ContractConversation from "@/db/models/Conversation";
import { getContractAndRole } from "@/lib/contractAuth";

function normalizeConversation(conv: { threads?: unknown[]; messages?: unknown[]; toObject?: () => object }) {
  const raw = conv && typeof conv.toObject === "function" ? conv.toObject() : conv;
  const threads =
    (raw as { threads?: unknown[] }).threads?.length > 0
      ? (raw as { threads: unknown[] }).threads
      : [{ subject: "General", messages: (raw as { messages?: unknown[] }).messages || [] }];
  return { ...(raw as object), threads };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractId } = await context.params;
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await getContractAndRole(contractId, clerkId);
    if (!result)
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    const contract = result.contract as any;
    const canonicalId = contract.contractId || contractId;

    const createPayload = {
      conversationId: `CONVO-${canonicalId}`,
      contractId: canonicalId,
      participants: { 
        client: contract.client?._id?.toString() || contract.client?.toString() || contract.ownerId || "missing_client", 
        contractor: contract.contractor?._id?.toString() || contract.contractor?.toString() || contract.ownerId || "missing_contractor" 
      },
      status: "active",
    };

    // Atomic Find or Create (Upsert)
    const conversation = await ContractConversation.findOneAndUpdate(
      { contractId: canonicalId },
      { 
        $setOnInsert: {
          ...createPayload,
          threads: [{ subject: "General", messages: [] }],
          messages: [],
        }
      },
      { upsert: true, new: true, lean: true }
    ).catch(err => {
      console.error("ContractConversation Upsert Error:", err);
      throw err;
    });

    if (!conversation)
      return NextResponse.json({ error: "Failed to load/create conversation" }, { status: 500 });

    // Update contract if it doesn't have conversationId yet
    if (!(contract as any).conversationId) {
      await Contract.updateOne(
        { _id: contract._id },
        { $set: { conversationId: conversation.conversationId } }
      );
    }

    const normalized = normalizeConversation(conversation as { threads?: unknown[]; messages?: unknown[] });
    return NextResponse.json(normalized);

  } catch (error: any) {
    console.error("DEBUG: Conversation API GET Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message,
      path: error.path // Useful for CastErrors
    }, { status: 500 });
  }
}
