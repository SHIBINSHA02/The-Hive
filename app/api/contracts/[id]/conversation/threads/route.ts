import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
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

/** POST - Create a new thread with a subject */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: contractId } = await context.params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getContractAndRole(contractId, clerkId);
  if (!result)
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  if (!subject)
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });

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
  conversation.threads.push({ subject, messages: [] });
  await conversation.save();

  const updated = await Conversation.findOne({ contractId }).lean();
  const normalized = normalizeConversation(updated as Parameters<typeof normalizeConversation>[0]);
  return NextResponse.json(normalized);
}
