"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Contract, Financial } from "@/types/contract";
import type { ConversationType } from "@/types/conversation";
import { Bot, Send, X, MessageSquare, Sparkles, Mail, Loader2 } from "lucide-react"; // <-- Added Mail and Loader2 icons

interface ContractDetailsResponse {
  contract: Contract;
  finance: Financial | null;
  role: "client" | "contractor" | "owner"; // Added owner just in case
}

export default function ContractDetailsPage() {
  const { contractname } = useParams();
  const contractId = decodeURIComponent(contractname as string);

  const [data, setData] = useState<Contract | null>(null);
  const [finance, setFinance] = useState<Financial | null>(null);
  const [conversationPreview, setConversationPreview] = useState<ConversationType | null>(null);

  const [viewerRole, setViewerRole] = useState<"client" | "contractor" | "owner" | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // PHASE 2: NEGOTIATION MODULE STATES
  // ==========================================
  // These states control the "Send for Review" modal and data submission.
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // --- AI CHAT STATES ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I'm your Hive Assistant. Ask me anything about this contract's clauses, deadlines, or payments." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (!contractId) return;

    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/contracts/${contractId}`, {
          method: "GET",
          cache: "no-store"
        });

        if (!res.ok) throw new Error("Failed to fetch contract");

        const json: ContractDetailsResponse = await res.json();
        setData(json.contract);
        setFinance(json.finance ?? null);
        setViewerRole(json.role);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  useEffect(() => {
    if (!contractId || !data) return;
    fetch(`/api/contracts/${contractId}/conversation`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((conv) => conv && setConversationPreview(conv))
      .catch(() => { });
  }, [contractId, data]);

  // --- CHAT HANDLER ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          prompt: userMsg,
          contractId: data?.contractId
        }),
      });
      const result = await response.json();
      setChatMessages(prev => [...prev, { role: "bot", text: result.text }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "bot", text: "Error connecting to AI. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ==========================================
  // PHASE 2: INVITE SUBMISSION LOGIC
  // ==========================================
  /**
   * Handles sending the counterparty's email to the backend.
   * This flips the contract status from "draft" to "sent_for_review".
   */
  const handleSendInvite = async () => {
    if (!inviteEmail.includes("@")) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    setIsSendingInvite(true);
    setInviteError("");

    try {
      // We will build this API route next!
      const res = await fetch(`/api/contracts/${contractId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send invite");
      }

      // Success! Update local state to reflect the new status
      setData(prev => prev ? { ...prev, contractStatus: "sent_for_review" } as Contract : null);
      setIsInviteModalOpen(false);
      setInviteEmail("");
      
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setIsSendingInvite(false);
    }
  };

  if (loading) return <div className="p-6 text-lg font-semibold">Loading contract…</div>;
  if (error) return <div className="p-6 text-red-600 font-semibold">Error: {error}</div>;
  if (!data) return <div className="p-6">No contract found</div>;

  // Determine if we should show the "Send for Review" button.
  // We only show it if the contract is still in the initial drafting phase.
  const canSendForReview = data.contractStatus === "draft" || data.contractStatus === "pending";

  return (
    <div className="w-full lg:px-6 px-0 lg:py-6 py-0 space-y-6 relative">
      {/* Header */}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow flex flex-col justify-end">
        {data.bgImageUrl && (
          <Image src={data.bgImageUrl} alt="Background" fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex items-end justify-between text-white">
          <div>
            <h1 className="text-3xl font-bold">{data.contractTitle}</h1>
            <div className="flex items-center gap-3 mt-2">
              {data.companyLogoUrl && (
                <Image src={data.companyLogoUrl} alt={data.companyName} width={38} height={38} className="rounded bg-white p-0.5" />
              )}
              <span className="text-lg">{data.companyName}</span>
            </div>
          </div>

          {/* NEW: Send for Review Button placed securely in the header */}
          {canSendForReview && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Send for Review
            </button>
          )}
        </div>
      </div>

      {/* Summary & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Summary</h2>
          <p className="mt-2 text-gray-700 whitespace-pre-line">{data.summary}</p>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Start Date:</strong> {new Date(data.startDate).toDateString()}</p>
            <p><strong>Deadline:</strong> {new Date(data.deadline).toDateString()}</p>
            <p>
              <strong>Status: </strong> 
              <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-gray-800 font-medium">
                {data.contractStatus.replace(/_/g, " ")}
              </span>
            </p>
            <p><strong>Contract ID:</strong> {data.contractId}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Progress</h2>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${data.progress}%` }}></div>
          </div>
          <p className="mt-2 text-sm text-gray-700">{data.progress}% Completed</p>
          <div className="mt-4">
            <h3 className="font-semibold">Key Points</h3>
            <ul className="list-disc ml-6 mt-2 text-sm text-gray-700">
              {data.keypoints?.map((k: string, idx: number) => (
                <li key={idx}>{k}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Communication Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-lg">Communication</h2>
        <p className="mt-1 text-sm text-gray-600">
          Professional communication with your {data.contractStatus === "active" ? "counterparty" : "client/contractor"}.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsChatOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            <Sparkles size={16} />
            Ask AI Assistant
          </button>

          <Link
            href={`/dashboard/mycontracts/${encodeURIComponent(contractId)}/conversation`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <MessageSquare size={16} />
            {conversationPreview ? "View Human Conversation" : "Open Conversation"}
          </Link>
        </div>
      </div>

      {/* Clauses Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-lg">Clauses</h2>
        <ul className="list-disc ml-6 mt-2 text-gray-700">
          {data.clauses?.map((c: string, idx: number) => (
            <li key={idx}>{c}</li>
          ))}
        </ul>
      </div>

      {/* Full Document Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-lg">Contract Document</h2>
        <div className="prose max-w-none mt-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.contractContent || ""}</ReactMarkdown>
        </div>
      </div>

      {/* ========================================== */}
      {/* PHASE 2: SEND FOR REVIEW MODAL             */}
      {/* ========================================== */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Invite to Negotiate</h3>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Enter the email address of the counterparty. They will receive a secure link to review and suggest edits to this document.
              </p>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Counterparty Email
                </label>
                <input
                  type="email"
                  placeholder="e.g., legal@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  autoFocus
                />
              </div>
              
              {inviteError && (
                <p className="mt-2 text-sm text-red-600 font-medium">{inviteError}</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={isSendingInvite || !inviteEmail}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AI CHAT SIDEBAR (Existing Code) --- */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2 text-blue-600">
              <Bot size={20} />
              <span className="font-bold">Hive AI</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-gray-200 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm ${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isTyping && <div className="text-xs text-gray-400 animate-pulse">Assistant is thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about this contract..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleSendMessage} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}