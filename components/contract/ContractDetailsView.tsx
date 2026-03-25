"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Contract, Financial } from "@/types/contract";
import type { ConversationType } from "@/types/conversation";
import { Bot, Send, X, MessageSquare, Sparkles, Loader2, ShieldAlert, ArrowLeft } from "lucide-react";

interface ContractDetailsViewProps {
  contractId: string;
  data: Contract | null;
  finance?: Financial | null;
  loading?: boolean;
  error?: string;
  headerActions?: React.ReactNode;
  logoOverlay?: React.ReactNode;
  bannerOverlay?: React.ReactNode;
  isEditing?: boolean;
  editContent?: string;
  setEditContent?: (content: string) => void;
  showDiff?: boolean;
  setShowDiff?: (show: boolean) => void;
  onPayMilestone?: (index: number) => Promise<void>;
  isPaying?: number | null;
}

export default function ContractDetailsView({ 
  contractId,
  data,
  finance,
  loading,
  error,
  headerActions,
  logoOverlay,
  bannerOverlay,
  isEditing = false,
  editContent = "",
  setEditContent,
  showDiff = false,
  setShowDiff,
  onPayMilestone,
  isPaying = null
}: ContractDetailsViewProps) {
  const [conversationPreview, setConversationPreview] = useState<ConversationType | null>(null);

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
    if (!contractId || !data) return;
    fetch(`/api/contracts/${contractId}/conversation`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((conv) => conv && setConversationPreview(conv))
      .catch(() => { });
  }, [contractId, data]);

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

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  );
  if (error) return <div className="p-6 text-red-600 font-semibold">Error: {error}</div>;
  if (!data) return <div className="p-6">No contract found</div>;

  return (
    <div className="w-full lg:px-6 px-0 lg:py-6 py-0 space-y-6 relative">
      {data.contractStatus === "terminated" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 shadow-sm animate-in fade-in slide-in-from-top-4">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-sm font-bold">Negotiation Terminated</p>
            <p className="text-xs opacity-90">This negotiation has been terminated by the counterparty or the owner. No further edits can be made.</p>
          </div>
        </div>
      )}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow flex flex-col justify-end group/bg">
        {data.bgImageUrl ? (
          <Image src={data.bgImageUrl} alt="Background" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}

        {bannerOverlay}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex items-end justify-between text-white">
          <div className="flex-1">
            <Link 
                href="/dashboard/mycontracts"
                className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Contracts
            </Link>
            <h1 className="text-3xl font-bold truncate max-w-[90%]">{data.contractTitle}</h1>
            <div className="flex items-center gap-3 mt-2 relative group/logo">
              {data.companyLogoUrl ? (
                <div className="relative w-[38px] h-[38px] rounded bg-white p-0.5 overflow-hidden">
                  <Image src={data.companyLogoUrl} alt={data.companyName} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-[38px] h-[38px] rounded bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">{data.companyName.charAt(0)}</span>
                </div>
              )}
              {logoOverlay}
              <span className="text-lg font-medium">{data.companyName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {headerActions}
          </div>
        </div>
      </div>

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
            <div className="pt-2 border-t border-gray-100 mt-2 space-y-1">
              <p className="text-xs text-gray-500"><strong>Creator Email:</strong> {data.ownerEmail || "N/A"}</p>
              <p className="text-xs text-gray-500"><strong>Counterparty Email:</strong> {data.partyB_Email || "N/A"}</p>
            </div>
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

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-lg">Communication</h2>
        <p className="mt-1 text-sm text-gray-600">
          Professional communication with the contract owner.
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
            href={`/dashboard/requests/${encodeURIComponent(contractId)}/conversation`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <MessageSquare size={16} />
            {conversationPreview ? "View Human Conversation" : "Open Conversation"}
          </Link>

          <Link
            href={`/dashboard/requests/${encodeURIComponent(contractId)}/riskdetect`}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 text-blue-600 bg-blue-100 px-4 py-2 text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            <ShieldAlert size={16} />
            Risk Detect
          </Link>
        </div>
      </div>

      {finance && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-semibold text-lg text-gray-900">Financial Ledger</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                finance.paymentStatus === "completed" ? "bg-green-100 text-green-700" : 
                finance.paymentStatus === "partial" ? "bg-amber-100 text-amber-700" : 
                "bg-gray-100 text-gray-600"
            }`}>
                {finance.paymentStatus.replace("_", " ")}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase">Total Amount</p>
              <p className="font-bold text-2xl text-gray-900 mt-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: finance.currency || 'USD' }).format(finance.totalAmount)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-xs font-medium text-green-600 uppercase">Paid Amount</p>
              <p className="font-bold text-2xl text-green-700 mt-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: finance.currency || 'USD' }).format(finance.paidAmount)}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <p className="text-xs font-medium text-amber-600 uppercase">Due Amount</p>
              <p className="font-bold text-2xl text-amber-700 mt-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: finance.currency || 'USD' }).format(finance.dueAmount)}</p>
            </div>
          </div>

          {finance.milestones && finance.milestones.length > 0 && (
            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-4">Payment Schedule</h3>
              <div className="space-y-3">
                {finance.milestones.map((milestone, idx) => (
                  <div key={idx} className={`flex flex-wrap items-center justify-between p-4 border rounded-lg transition-colors ${milestone.isPaid ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100 hover:border-blue-300 shadow-sm'}`}>
                    <div>
                      <p className={`font-medium text-sm ${milestone.isPaid ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {milestone.title || `Installment ${idx + 1}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Due: {new Date(milestone.dueDate).toDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-semibold ${milestone.isPaid ? 'text-gray-400' : 'text-gray-900'}`}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: finance.currency || 'USD' }).format(milestone.amount)}
                      </span>
                      
                      {milestone.isPaid ? (
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                          Paid
                        </span>
                      ) : data.contractStatus === "active" ? (
                        <button 
                          onClick={() => onPayMilestone?.(idx)}
                          disabled={isPaying === idx}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded-md font-bold transition-all shadow shadow-blue-200 hover:shadow-md disabled:bg-blue-400"
                        >
                          {isPaying === idx ? "Processing..." : "Mark as Paid"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                          Awaiting Signatures
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-lg">Clauses</h2>
        <ul className="list-disc ml-6 mt-2 text-gray-700">
          {data.clauses?.map((c: string, idx: number) => (
            <li key={idx}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-lg">Contract Document</h2>
              
              {data.versionHistory && data.versionHistory.length > 0 && !isEditing && (
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setShowDiff?.(false)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${!showDiff ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}
                  >
                    Current Version
                  </button>
                  <button 
                    onClick={() => setShowDiff?.(true)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${showDiff ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}
                  >
                    View Changes
                  </button>
                </div>
              )}
            </div>
        </div>
        
        <div className="mt-4">
          {isEditing ? (
              <textarea
                  value={editContent}
                  onChange={(e) => setEditContent?.(e.target.value)}
                  className="w-full min-h-[500px] p-4 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Type your contract edits here..."
              />
          ) : showDiff && data.versionHistory && data.versionHistory.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                <ReactDiffViewer
                  oldValue={data.versionHistory[data.versionHistory.length - 1].contentSnapshot}
                  newValue={data.contractContent || ""}
                  splitView={true}
                  useDarkTheme={false}
                  leftTitle="Previous Version"
                  rightTitle="Proposed Changes"
                />
              </div>
          ) : (
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.contractContent || ""}</ReactMarkdown>
              </div>
          )}
        </div>
      </div>

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
