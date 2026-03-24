"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import type { ConversationType, ConversationThread } from "@/types/conversation";

export default function ContractConversationPage() {
  const params = useParams();
  const pathname = usePathname();
  
  // Handle both [contractname] and [id] parameter names
  const idValue = params.contractname || params.id;
  const contractId = decodeURIComponent(idValue as string);

  // Determine back link base
  const isRequestPath = pathname.includes("/dashboard/requests/");
  let backPath: string;
  if (isRequestPath) {
    backPath = `/dashboard/requests/${encodeURIComponent(contractId)}`;
  } else {
    // Extract the status segment from the pathname, e.g. /dashboard/mycontracts/draft/:id/conversation → draft
    const mycontractsMatch = pathname.match(/\/dashboard\/mycontracts\/([^/]+)\//);
    const statusSegment = mycontractsMatch ? mycontractsMatch[1] : null;
    backPath = statusSegment
      ? `/dashboard/mycontracts/${statusSegment}/${encodeURIComponent(contractId)}`
      : `/dashboard/mycontracts`;
  }

  const [conversation, setConversation] = useState<ConversationType | null>(null);
  const [viewerInfo, setViewerInfo] = useState<{ role: string; senderProfileId: string } | null>(null);
  const [contractTitle, setContractTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // For real-time "Undo" button visibility updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000); 
    return () => clearInterval(interval);
  }, []);

  const selectedThread = conversation?.threads?.find(
    (t) => t._id === selectedThreadId
  ) ?? null;

  const fetchConversation = async () => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/conversation`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.details || errJson.error || "Failed to load conversation");
      }
      const data = await res.json();
      setConversation(data);
      setViewerInfo({
        role: data.viewerRole,
        senderProfileId: data.viewerProfileId
      });
      if (data.threads?.length && !selectedThreadId)
        setSelectedThreadId(data.threads[0]._id);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Something went wrong loading conversation");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contractId) return;
    fetchConversation();
  }, [contractId]);

  useEffect(() => {
    if (!contractId) return;
    fetch(`/api/contracts/${contractId}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => json?.contract?.contractTitle && setContractTitle(json.contract.contractTitle))
      .catch(() => {});
  }, [contractId]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    const subject = newSubject.trim();
    if (!subject || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/conversation/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      if (!res.ok) throw new Error("Failed to create thread");
      const data = await res.json();
      setConversation(data);
      setViewerInfo({
        role: data.viewerRole,
        senderProfileId: data.viewerProfileId
      });
      const newThread = data.threads?.find((t: ConversationThread) => t.subject === subject);
      if (newThread) setSelectedThreadId(newThread._id);
      setNewSubject("");
      setShowNewThread(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create thread");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = replyMessage.trim();
    if (!msg || !selectedThreadId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/contracts/${contractId}/conversation/threads/${selectedThreadId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg }),
        }
      );
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      setConversation(data);
      setViewerInfo({
        role: data.viewerRole,
        senderProfileId: data.viewerProfileId
      });
      setReplyMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUndoMessage = async (messageId: string) => {
    if (!selectedThreadId || submitting) return;
    if (!confirm("Are you sure you want to undo this message?")) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/contracts/${contractId}/conversation/threads/${selectedThreadId}/messages/${messageId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to undo message");
      }
      const data = await res.json();
      setConversation(data);
      setViewerInfo({
        role: data.viewerRole,
        senderProfileId: data.viewerProfileId
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to undo message");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(date);
  };

  const canUndo = (msg: any) => {
    if (!msg.createdAt || !viewerInfo || msg.senderId !== viewerInfo.senderProfileId) return false;
    const createdAt = new Date(msg.createdAt);
    const diff = Date.now() - createdAt.getTime();
    return diff < 120 * 1000; // 2 minutes
  };

  if (loading)
    return (
      <div className="p-6">
        <p className="text-lg font-semibold">Loading conversation…</p>
      </div>
    );

  if (error && !conversation)
    return (
      <div className="p-6 text-red-600">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
        <Link
          href={backPath}
          className="mt-2 inline-block text-blue-600 hover:underline"
        >
          Back to contract
        </Link>
      </div>
    );

  return (
    <div className="w-full lg:px-6 px-0 lg:py-6 py-0 flex flex-col h-[calc(100vh-8rem)] min-h-[400px]">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href={backPath}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Back to contract"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-bold">
            {contractTitle ? `Conversation: ${contractTitle}` : "Conversation"}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-1 gap-4 min-h-0 rounded-xl border border-gray-200 bg-white shadow">
        {/* Thread list */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 p-3">
            <span className="font-semibold text-gray-800">Threads</span>
            <button
              type="button"
              onClick={() => setShowNewThread(true)}
              className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              New thread
            </button>
          </div>
          {showNewThread && (
            <form onSubmit={handleCreateThread} className="border-b border-gray-200 p-3">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Subject (e.g. Milestone 1 delivery)"
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                required
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewThread(false); setNewSubject(""); }}
                  className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          <ul className="flex-1 overflow-y-auto p-2">
            {conversation?.threads?.length ? (
              conversation.threads.map((thread, threadIndex) => (
                <li key={thread._id ?? `thread-${threadIndex}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedThreadId(thread._id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedThreadId === thread._id
                        ? "bg-blue-100 font-medium text-blue-900"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="block truncate">{thread.subject}</span>
                    <span className="text-xs text-gray-500">
                      {thread.messages?.length ?? 0} message{(thread.messages?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500">No threads yet. Create one above.</li>
            )}
          </ul>
        </aside>

        {/* Messages */}
        <section className="flex flex-1 flex-col min-w-0">
          {selectedThread ? (
            <>
              <div className="border-b border-gray-200 px-4 py-2">
                <h2 className="font-semibold text-gray-900">{selectedThread.subject}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedThread.messages?.length ? (
                  selectedThread.messages.map((msg, idx) => (
                    <div
                      key={msg._id ?? `msg-${idx}`}
                      className={`flex ${msg.senderRole === "system" ? "justify-center" : (msg.senderRole === "client" || msg.senderRole === "owner") ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm relative group ${
                          msg.senderRole === "system"
                            ? "bg-gray-100 text-gray-600"
                            : (msg.senderRole === "client" || msg.senderRole === "owner")
                            ? "bg-gray-100 text-gray-900"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">
                                {msg.senderRole}
                            </span>
                            <span className="text-[10px] opacity-70">
                                {formatTime(msg.createdAt)}
                            </span>
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap leading-tight">{msg.message}</p>
                        
                        {canUndo(msg) && (
                            <button
                                onClick={() => handleUndoMessage(msg._id!)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                            >
                                Undo
                            </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No messages in this thread yet.</p>
                )}
              </div>
              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 border-t border-gray-200 p-3"
              >
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your message…"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={submitting || !replyMessage.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-500">
              Select a thread or create a new one.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
