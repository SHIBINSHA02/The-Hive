import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import Conversation from "@/db/models/Conversation";
import Contract from "@/db/models/Contract";
import { getContractAndRole } from "@/lib/contractAuth";

function normalizeConversation(conv: { threads?: unknown[]; messages?: unknown[]; toObject?: () => object }) {
  const raw = conv && typeof conv.toObject === "function" ? conv.toObject() : conv;
  const threads =
    (raw as { threads?: unknown[] }).threads?.length > 0
      ? (raw as { threads: unknown[] }).threads
      : [{ subject: "General", messages: (raw as { messages?: unknown[] }).messages || [] }];
  return { ...(raw as object), threads };
}

/** POST - Add a message to a thread */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string; threadId: string }> }
) {
  const { id: contractId, threadId } = await context.params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getContractAndRole(contractId, clerkId);
  if (!result)
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message)
    return NextResponse.json({ error: "Message is required" }, { status: 400 });

  if (!mongoose.Types.ObjectId.isValid(threadId))
    return NextResponse.json({ error: "Invalid thread id" }, { status: 400 });

  await connectDB();

  let conversation = await Conversation.findOne({ contractId });
  if (!conversation) {
    const contract = await Contract.findById(contractId).select("client contractor contractId").lean();
    if (!contract)
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    const created = await Conversation.create({
      conversationId: `CONVO-${(contract as { contractId?: string }).contractId ?? contractId}`,
      contractId,
      participants: { client: (contract as { client: unknown }).client, contractor: (contract as { contractor: unknown }).contractor },
      threads: [],
      messages: [],
      status: "active",
    });
    await Contract.findByIdAndUpdate(contractId, { conversationId: created.conversationId });
    conversation = created;
  }

  conversation.threads = conversation.threads || [];
  const thread = conversation.threads.id(threadId);
  if (!thread)
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  thread.messages.push({
    senderId: result.senderProfileId,
    senderRole: result.role,
    message,
    isRead: false,
  });
  conversation.lastMessage = message;
  await conversation.save();

  const updated = await Conversation.findOne({ contractId }).lean();
  const normalized = normalizeConversation(updated as Parameters<typeof normalizeConversation>[0]);
  return NextResponse.json(normalized);
}
