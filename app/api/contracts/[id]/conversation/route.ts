import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Contract from "@/db/models/Contract";
import Conversation from "@/db/models/Conversation";
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
  const { id: contractId } = await context.params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getContractAndRole(contractId, clerkId);
  if (!result)
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });

  await connectDB();

  type ConvLean = { threads?: unknown[]; messages?: unknown[]; conversationId?: string; toObject?: () => object };
  let conversation: ConvLean | null = null;

  // Mongoose Model union types break findOne/create inference
  const existing = await (
    Conversation as { findOne: (q: object) => { lean: () => { exec: () => Promise<ConvLean | null> } } }
  ).findOne({ contractId }).lean().exec();
  conversation = existing;

  if (!conversation) {
    const contract = await (
      Contract as { findById: (id: string) => { select: (s: string) => { lean: () => { exec: () => Promise<unknown> } } } }
    ).findById(contractId).select("client contractor contractId").lean().exec();
    if (!contract)
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    const contractDoc = contract as { contractId?: string; client: unknown; contractor: unknown };
    const createPayload = {
      conversationId: `CONVO-${contractDoc.contractId ?? contractId}`,
      contractId,
      participants: { client: contractDoc.client, contractor: contractDoc.contractor },
      threads: [{ subject: "General", messages: [] }],
      messages: [],
      status: "active",
    };
    const created = await (
      Conversation as { create: (doc: typeof createPayload) => Promise<{ conversationId: string; toObject?: () => object } | { conversationId: string; toObject?: () => object }[]> }
    ).create(createPayload);
    const doc = Array.isArray(created) ? created[0] ?? null : created;
    if (!doc)
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });

    await Contract.updateOne(
      { _id: contractId },
      { $set: { conversationId: (doc as { conversationId: string }).conversationId } }
    );
    conversation = typeof (doc as { toObject?: () => object }).toObject === "function"
      ? (doc as { toObject: () => object }).toObject()
      : (doc as object);
  }

  const normalized = normalizeConversation(conversation as { threads?: unknown[]; messages?: unknown[] });
  return NextResponse.json(normalized);
}
