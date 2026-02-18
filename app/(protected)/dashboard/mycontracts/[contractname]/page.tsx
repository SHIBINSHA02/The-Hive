"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Contract, Financial } from "@/types/contract";
import type { ConversationType } from "@/types/conversation";
import { Bot, Send, X, MessageSquare, Sparkles } from "lucide-react";

interface ContractDetailsResponse {
  contract: Contract;
  finance: Financial | null;
  role: "client" | "contractor";
}

export default function ContractDetailsPage() {
  const { contractname } = useParams();
  const contractId = decodeURIComponent(contractname as string);

  const [data, setData] = useState<Contract | null>(null);
  const [finance, setFinance] = useState<Financial | null>(null);
  const [conversationPreview, setConversationPreview] = useState<ConversationType | null>(null);

  const [viewerRole, setViewerRole] = useState<"client" | "contractor" | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div className="p-6 text-lg font-semibold">Loading contract…</div>;
  if (error) return <div className="p-6 text-red-600 font-semibold">Error: {error}</div>;
  if (!data) return <div className="p-6">No contract found</div>;

  return (
    <div className="w-full lg:px-6 px-0 lg:py-6 py-0 space-y-6 relative">
      {/* Header */}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow">
        {data.bgImageUrl && (
          <Image src={data.bgImageUrl} alt="Background" fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-end p-6 text-white">
          <div>
            <h1 className="text-3xl font-bold">{data.contractTitle}</h1>
            <div className="flex items-center gap-3 mt-2">
              {data.companyLogoUrl && (
                <Image src={data.companyLogoUrl} alt={data.companyName} width={38} height={38} className="rounded" />
              )}
              <span className="text-lg">{data.companyName}</span>
            </div>
            {viewerRole && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-medium uppercase tracking-wide">
                  You are logged in as&nbsp;
                  <span className="capitalize">{viewerRole}</span>
                </span>
                <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1">
                  Counterparty:&nbsp;
                  <span className="font-semibold">
                    {data.counterpartyName ||
                      (viewerRole === "client"
                        ? data.contractorName || "Contractor"
                        : data.clientName || "Client")}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Summary</h2>
          <p className="mt-2 text-gray-700 whitespace-pre-line">{data.summary}</p>
          <div className="mt-4 space-y-2 text-sm">
            {viewerRole && (
              <>
                <p>
                  <strong>Your Role:</strong>{" "}
                  <span className="capitalize">{viewerRole}</span>
                </p>
                <p>
                  <strong>Counterparty:</strong>{" "}
                  {data.counterpartyName ||
                    (viewerRole === "client"
                      ? data.contractorName || "Contractor"
                      : data.clientName || "Client")}
                </p>
              </>
            )}
            <p><strong>Start Date:</strong> {new Date(data.startDate).toDateString()}</p>
            <p><strong>Deadline:</strong> {new Date(data.deadline).toDateString()}</p>
            <p><strong>Status:</strong> <span className="capitalize">{data.contractStatus}</span></p>
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

      {/* Communication Section (Combined AI & Human) */}
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

          {conversationPreview?.lastMessage && (
            <span className="text-xs text-gray-500 w-full mt-1 italic">
              Last message: "{conversationPreview.lastMessage.slice(0, 40)}..."
            </span>
          )}
        </div>
      </div>

      {/* Finance Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-lg">Finance</h2>
        {finance ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-lg">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: finance.currency || "INR" }).format(finance.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="font-semibold text-lg text-blue-600">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: finance.currency || "INR" }).format(finance.paidAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Amount</p>
                <p className="font-semibold text-lg text-blue-600">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: finance.currency || "INR" }).format(finance.dueAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${finance.paymentStatus === "completed" ? "bg-blue-100 text-blue-800" : "bg-blue-700 text-white"
                  }`}>
                  {finance.paymentStatus?.replace(/_/g, " ") ?? "N/A"}
                </span>
              </div>
            </div>

            {finance.milestones && finance.milestones.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Milestones</h3>
                <ul className="space-y-3">
                  {finance.milestones.map((m, idx) => (
                    <li key={idx} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <div>
                        <p className="font-medium">{m.title || `Milestone ${idx + 1}`}</p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(m.dueDate).toLocaleDateString()} · {new Intl.NumberFormat("en-IN", { style: "currency", currency: finance.currency || "INR" }).format(m.amount)}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.isPaid ? "bg-blue-100 text-blue-800" : "bg-blue-700 text-white"}`}>
                        {m.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-gray-600">No financial data available.</p>
        )}
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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.contractContent}</ReactMarkdown>
        </div>
      </div>

      {/* --- AI CHAT SIDEBAR --- */}
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