import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import ContractConversation from "@/db/models/Conversation";
import { getContractAndRole } from "@/lib/contractAuth";

function normalizeConversation(conv: any) {
  const raw = conv && typeof conv.toObject === "function" ? conv.toObject() : conv;
  const threads =
    raw.threads?.length > 0
      ? raw.threads
      : [{ subject: "General", messages: raw.messages || [] }];
  return { ...raw, threads };
}

/** DELETE - Undo/Delete a message within 2 minutes */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; threadId: string; messageId: string }> }
) {
  try {
    const { id: contractIdParam, threadId, messageId } = await context.params;
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await getContractAndRole(contractIdParam, clerkId);
    if (!result)
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    const contract = result.contract as any;
    const canonicalId = contract.contractId || contractIdParam;

    if (!mongoose.Types.ObjectId.isValid(threadId) || !mongoose.Types.ObjectId.isValid(messageId))
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

    await connectDB();

    const conversation = await ContractConversation.findOne({ contractId: canonicalId });
    if (!conversation)
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const thread = (conversation.threads as any).id(threadId);
    if (!thread)
        return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const message = (thread.messages as any).id(messageId);
    if (!message)
        return NextResponse.json({ error: "Message not found" }, { status: 404 });

    // 1. Verify ownership
    if (message.senderId !== result.senderProfileId) {
        return NextResponse.json({ error: "You can only undo your own messages" }, { status: 403 });
    }

    // 2. Verify 2-minute window
    const now = new Date();
    const createdAt = new Date(message.createdAt);
    const diffMs = now.getTime() - createdAt.getTime();
    const TWO_MINUTES_MS = 2 * 60 * 1000;

    if (diffMs > TWO_MINUTES_MS) {
        return NextResponse.json({ error: "Undo period (2 minutes) has expired" }, { status: 400 });
    }

    // 3. Remove message
    (message as any).remove();
    await conversation.save();

    const updated = await ContractConversation.findOne({ contractId: canonicalId }).lean().exec();
    const normalized = normalizeConversation(updated);
    
    return NextResponse.json({
        ...normalized,
        viewerRole: result.role,
        viewerProfileId: result.senderProfileId
    });

  } catch (error: any) {
    console.error("DEBUG: Conversation Message DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
