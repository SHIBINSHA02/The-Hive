"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Contract, Financial } from "@/types/contract";
import type { ConversationType } from "@/types/conversation";
import { Bot, Send, X, MessageSquare, Sparkles, Loader2, ShieldAlert, ArrowLeft, Landmark, CreditCard, Calendar } from "lucide-react";

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
  onFinanceChange?: (finance: any) => void;
  tempFinance?: Financial | null;
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
  isPaying = null,
  onFinanceChange,
  tempFinance
}: ContractDetailsViewProps) {
  const pathname = usePathname();
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

  const activeFinance = tempFinance || finance;
  const isStarted = data?.contractStatus === "active" || data?.contractStatus === "completed";
  const totalMilestones = activeFinance?.milestones?.length || 0;
  const paidMilestonesCount = activeFinance?.milestones?.filter(m => m.isPaid).length || 0;
  const financialProgress = totalMilestones > 0 ? Math.round((paidMilestonesCount / totalMilestones) * 100) : (data?.progress || 0);

  const displayedProgress = isStarted ? ((activeFinance && totalMilestones > 0) ? financialProgress : (data?.progress || 0)) : 0;

  return (
    <div className="w-full lg:px-6 px-0 lg:py-6 py-0 space-y-6 relative">
      {data?.contractStatus === "terminated" && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Summary</h2>
          <p className="mt-2 text-gray-700 whitespace-pre-line">{data.summary}</p>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Start Date:</strong> {new Date(data.startDate).toDateString()}</p>
            <p><strong>Deadline:</strong> {new Date(data.deadline).toDateString()}</p>
            <p>
              <strong>Status: </strong> 
              <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-gray-800 font-medium">
                {data?.contractStatus?.replace(/_/g, " ") || 'Draft'}
              </span>
            </p>
            <div className="pt-2 border-t border-gray-100 mt-2 space-y-1">
              <p className="text-xs text-gray-500"><strong>Creator Email:</strong> {data.ownerEmail || "N/A"}</p>
              <p className="text-xs text-gray-500"><strong>Counterparty Email:</strong> {data.partyB_Email || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Progress</h2>
            {isStarted ? (
              (finance && totalMilestones > 0) && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-100">
                  Milestone Based
                </span>
              )
            ) : (
              <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-gray-100">
                Awaiting Agreement
              </span>
            )}
          </div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out shadow-sm" 
              style={{ width: `${displayedProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm font-bold text-gray-900">{displayedProgress}% Completed</p>
            {(finance && totalMilestones > 0) && (
              <p className="text-xs text-gray-500 font-medium">{paidMilestonesCount} of {totalMilestones} Paid</p>
            )}
          </div>
          <div className="mt-4">
            <h3 className="font-semibold">Key Points</h3>
            <ul className="list-disc ml-6 mt-2 text-sm text-gray-700">
              {data.keypoints?.map((k: string, idx: number) => {
                const isPaymentPoint = k.toLowerCase().trim().startsWith("payment:");
                if (isPaymentPoint && activeFinance) {
                  return (
                    <li key={idx}>
                      <strong>Payment:</strong> {new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: activeFinance.currency || 'USD' 
                      }).format(activeFinance.totalAmount)}
                    </li>
                  );
                }
                return <li key={idx}>{k}</li>;
              })}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Finance Overview</h2>
            <Landmark className="w-5 h-5 text-gray-400" />
          </div>

          {(activeFinance || isEditing) ? (
            <div className="flex-1 flex flex-col gap-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Total Amount</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-xs text-gray-400 font-bold">$</span>
                        <input 
                          type="number"
                          value={activeFinance?.totalAmount || 0}
                          onChange={(e) => onFinanceChange?.({ ...activeFinance, totalAmount: Number(e.target.value) })}
                          className="w-full pl-5 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Currency</label>
                      <select 
                        value={activeFinance?.currency || "USD"}
                        onChange={(e) => onFinanceChange?.({ ...activeFinance, currency: e.target.value })}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <p className="text-[10px] text-blue-600 uppercase font-bold mb-2">Milestones Schedule</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {activeFinance?.milestones?.map((m, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded relative group">
                          <input 
                            type="text"
                            value={m.title}
                            onChange={(e) => {
                              const newM = [...(activeFinance?.milestones || [])];
                              newM[idx].title = e.target.value;
                              onFinanceChange?.({ ...activeFinance, milestones: newM });
                            }}
                            placeholder="Milestone"
                            className="flex-1 bg-transparent border-b border-gray-200 text-[11px] font-bold outline-none focus:border-blue-500"
                          />
                          <input 
                            type="number"
                            value={m.amount}
                            onChange={(e) => {
                              const newM = [...(activeFinance?.milestones || [])];
                              newM[idx].amount = Number(e.target.value);
                              onFinanceChange?.({ ...activeFinance, milestones: newM });
                            }}
                            className="w-16 bg-transparent border-b border-gray-200 text-[11px] font-bold outline-none focus:border-blue-500"
                          />
                          <button 
                            onClick={() => {
                              const newM = activeFinance?.milestones?.filter((_, i) => i !== idx);
                              onFinanceChange?.({ ...activeFinance, milestones: newM });
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button 
                         onClick={() => {
                           const newM = [...(activeFinance?.milestones || []), { title: "", amount: 0, dueDate: new Date().toISOString(), isPaid: false }];
                           onFinanceChange?.({ ...activeFinance, milestones: newM });
                         }}
                         className="w-full py-1.5 border border-dashed border-blue-200 text-blue-600 text-[10px] font-bold rounded hover:bg-blue-50 transition-colors"
                      >
                        + Add Milestone
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Total Value</p>
                        <p className="text-2xl font-bold text-gray-900 leading-none mt-1">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: activeFinance?.currency || 'USD' }).format(activeFinance?.totalAmount || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-medium">Paid</p>
                        <p className="text-lg font-semibold text-blue-600 leading-none mt-1">
                          {displayedProgress}%
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${displayedProgress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Paid to date</p>
                        <p className="text-sm font-bold text-gray-900">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: activeFinance?.currency || 'USD', maximumFractionDigits: 0 }).format(activeFinance?.paidAmount || 0)}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-blue-600 uppercase font-bold mb-0.5">Remaining</p>
                        <p className="text-sm font-bold text-blue-700">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: activeFinance?.currency || 'USD', maximumFractionDigits: 0 }).format(activeFinance?.dueAmount || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {activeFinance?.milestones && activeFinance.milestones.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      {(() => {
                        const nextMilestone = activeFinance.milestones.find(m => !m.isPaid);
                        if (!nextMilestone) return (
                          <div className="flex items-center gap-2 text-green-600 text-xs font-semibold py-1">
                            <CreditCard size={14} />
                            All payments completed
                          </div>
                        );
                        return (
                          <div className="space-y-1.5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Next Milestone</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700 truncate max-w-[140px]">{nextMilestone.title || "Payment"}</span>
                              <span className="text-xs font-extrabold text-blue-600">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: activeFinance.currency || 'USD' }).format(nextMilestone.amount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <Calendar size={12} className="text-gray-400" />
                              <span className="font-medium">Due: {new Date(nextMilestone.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-2">
              <CreditCard className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">No financial structure defined</p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[180px]">Finance overview will appear once milestones are set.</p>
            </div>
          )}
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
            href={`${pathname}/conversation`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <MessageSquare size={16} />
            {conversationPreview ? "View Human Conversation" : "Open Conversation"}
          </Link>

          <Link
            href={`${pathname}/riskdetect`}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 text-blue-600 bg-blue-100 px-4 py-2 text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            <ShieldAlert size={16} />
            Risk Detect
          </Link>
        </div>
      </div>

      {activeFinance && !isEditing && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-semibold text-lg text-gray-900">Financial Ledger</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                activeFinance.paymentStatus === "completed" ? "bg-green-100 text-green-700" : 
                activeFinance.paymentStatus === "partial" ? "bg-amber-100 text-amber-700" : 
                "bg-gray-100 text-gray-600"
            }`}>
                {activeFinance.paymentStatus?.replace("_", " ") || "Pending"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase">Total Amount</p>
              <p className="font-bold text-2xl text-gray-900 mt-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: activeFinance.currency || 'USD' }).format(activeFinance.totalAmount)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-xs font-medium text-blue-600 uppercase">Paid Amount</p>
              <p className="font-bold text-2xl text-blue-700 mt-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: activeFinance.currency || 'USD' }).format(activeFinance.paidAmount)}</p>
            </div>
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
              <p className="text-xs font-medium text-cyan-600 uppercase">Due Amount</p>
              <p className="font-bold text-2xl text-cyan-700 mt-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: activeFinance.currency || 'USD' }).format(activeFinance.dueAmount)}</p>
            </div>
          </div>

          {activeFinance.milestones && activeFinance.milestones.length > 0 && (
            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-4">Payment Schedule</h3>
              <div className="space-y-3">
                {activeFinance.milestones.map((milestone, idx) => (
                  <div key={idx} className={`flex flex-wrap items-center justify-between p-4 border rounded-lg transition-colors ${milestone.isPaid ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100 hover:border-blue-300 shadow-sm'}`}>
                    <div>
                      <p className={`font-medium text-sm ${milestone.isPaid ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {milestone.title || `Installment ${idx + 1}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Due: {new Date(milestone.dueDate).toDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-semibold ${milestone.isPaid ? 'text-gray-400' : 'text-gray-900'}`}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: activeFinance.currency || 'USD' }).format(milestone.amount)}
                      </span>
                      
                      {milestone.isPaid ? (
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                          Paid
                        </span>
                      ) : data?.contractStatus === "active" ? (
                        <button 
                          onClick={() => onPayMilestone?.(idx)}
                          disabled={isPaying === idx}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded-md font-bold transition-all shadow shadow-blue-200 hover:shadow-md disabled:bg-blue-400"
                        >
                          {isPaying === idx ? "Processing..." : "Mark as Paid"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-cyan-600 font-medium bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200">
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
