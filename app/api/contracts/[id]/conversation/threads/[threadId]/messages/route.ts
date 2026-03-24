import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import ContractConversation from "@/db/models/Conversation";
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
  const { id: contractIdParam, threadId } = await context.params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getContractAndRole(contractIdParam, clerkId);
  if (!result)
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });

  const contract = result.contract as any;
  const canonicalId = contract.contractId || contractIdParam;
  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message)
    return NextResponse.json({ error: "Message is required" }, { status: 400 });

  if (!mongoose.Types.ObjectId.isValid(threadId))
    return NextResponse.json({ error: "Invalid thread id" }, { status: 400 });

  await connectDB();

  type ConvDoc = { threads: { id: (tid: string) => { messages: { push: (m: object) => void } } | null }; lastMessage?: string; save: () => Promise<unknown>; conversationId: string };
  const findOne = (ContractConversation as { findOne: (q: object) => Promise<ConvDoc | null> }).findOne.bind(ContractConversation);
  let conversation = await findOne({ contractId: canonicalId });

  if (!conversation) {
    const createPayload = {
      conversationId: `CONVO-${canonicalId}`,
      contractId: canonicalId,
      participants: { 
        client: contract.client?._id?.toString() || contract.client?.toString() || "", 
        contractor: contract.contractor?._id?.toString() || contract.contractor?.toString() || "" 
      },
      threads: [],
      messages: [],
      status: "active",
    };
    const created = await (
      ContractConversation as { create: (doc: typeof createPayload) => Promise<ConvDoc | ConvDoc[]> }
    ).create(createPayload);
    const doc = Array.isArray(created) ? created[0] ?? null : created;
    if (!doc)
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
    await (Contract as { findOneAndUpdate: (q: object, update: object, options?: object) => Promise<unknown> }).findOneAndUpdate({ _id: (contract as any)._id }, { conversationId: doc.conversationId }, {});
    conversation = doc;
  }

  if (!conversation.threads) {
    (conversation as { threads: unknown[] }).threads = [];
  }
  const thread = conversation.threads.id(threadId);
  if (!thread)
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  thread.messages.push({
    senderId: result.senderProfileId,
    senderRole: result.role,
    message,
    attachments: [],
    isRead: false,
  });
  conversation.lastMessage = message;

  // Double check participants to prevent validation error on save
  if (conversation.participants) {
    if (!conversation.participants.client || conversation.participants.client === "") {
      conversation.participants.client = 
        contract.client?._id?.toString() || 
        contract.client?.toString() || 
        contract.ownerId || 
        "missing_client";
    }
    if (!conversation.participants.contractor || conversation.participants.contractor === "") {
      conversation.participants.contractor = 
        contract.contractor?._id?.toString() || 
        contract.contractor?.toString() || 
        contract.ownerId || 
        "missing_contractor";
    }
  }

  await conversation.save();

  const updated = await (
    ContractConversation as { findOne: (q: object) => { lean: () => { exec: () => Promise<unknown> } } }
  ).findOne({ contractId: canonicalId }).lean().exec();
  const normalized = normalizeConversation(updated as Parameters<typeof normalizeConversation>[0]);
  return NextResponse.json({
    ...normalized,
    viewerRole: result.role,
    viewerProfileId: result.senderProfileId
  });
}
