"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Contract, Financial } from "@/types/contract";
import { Bot, Send, X, Sparkles, Loader2, Camera, Edit3, Save, ArrowLeft, ShieldAlert, Mail, Trash2 } from "lucide-react";

interface ContractDetailsResponse {
  contract: Contract;
  versionHistory?: { contentSnapshot: string; updatedAt: Date }[];
  finance: Financial | null;
  role: "client" | "contractor" | "owner" | "partyB";
}

export default function DraftContractDetailsPage() {
  const { contractname } = useParams();
  const contractId = decodeURIComponent(contractname as string);
  const router = useRouter();

  const [data, setData] = useState<Contract | null>(null);
  const [finance, setFinance] = useState<Financial | null>(null);
  const [viewerRole, setViewerRole] = useState<"client" | "contractor" | "owner" | "partyB" | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAgreeing, setIsAgreeing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const [showDiff, setShowDiff] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I'm your Hive Assistant. Ask me anything about this draft contract." }
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

  const handleSendInvite = async () => {
    if (!data?.partyB_Email || !data.partyB_Email.includes("@")) {
      alert("Please set a valid counterparty email in the 'Edit Draft' page first.");
      return;
    }

    if (!window.confirm(`Are you sure you want to send this contract to ${data.partyB_Email} for review?`)) {
      return;
    }

    setIsSendingInvite(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.partyB_Email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send invite");
      }

      router.push(`/dashboard/requests/${contractId}`);
    } catch (err: any) {
      alert(err.message || "Something went wrong sending the invite.");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this draft? This action cannot be undone.")) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/contracts/${contractId}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete draft");
      }
      router.push("/dashboard/mycontracts");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
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
      {/* Header */}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow flex flex-col justify-end group/bg">
        {data.bgImageUrl ? (
          <Image src={data.bgImageUrl} alt="Background" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}

        {viewerRole === "owner" && (
          <label className="absolute top-4 right-4 z-50 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 text-sm font-bold shadow-2xl border border-white/20">
            <Camera className="w-5 h-5 text-blue-400" />
            <span>Change Background</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    const base64 = reader.result as string;
                    setData(prev => prev ? { ...prev, bgImageUrl: base64 } as Contract : null);
                    try {
                      await fetch(`/api/contracts/${contractId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ bgImageUrl: base64 })
                      });
                    } catch (err) {
                      console.error("Failed to update background", err);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }} 
            />
          </label>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-6 flex items-end justify-between text-white">
          <div>
            <Link 
              href="/dashboard/mycontracts"
              className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Contracts
            </Link>
            <h1 className="text-3xl font-bold">{data.contractTitle}</h1>
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

              {viewerRole === "owner" && (
                <label className="absolute -top-3 -left-3 z-50 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full cursor-pointer transition-all shadow-xl border-2 border-white">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const base64 = reader.result as string;
                          setData(prev => prev ? { ...prev, companyLogoUrl: base64 } as Contract : null);
                          try {
                            await fetch(`/api/contracts/${contractId}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ companyLogoUrl: base64 })
                            });
                          } catch (err) {
                            console.error("Failed to update logo", err);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              )}

              <span className="text-lg">{data.companyName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {viewerRole === "owner" && (
              <>
                <Link
                  href={`/dashboard/mycontracts/draft/${encodeURIComponent(contractId)}/edit`}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Draft
                </Link>

                <button
                  onClick={handleSendInvite}
                  disabled={isSendingInvite}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
                >
                  {isSendingInvite ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                  Send for Review
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-white/10 hover:bg-red-600/20 text-white/70 hover:text-white px-4 py-2.5 rounded-lg font-semibold border border-white/20 hover:border-red-500 transition-all flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  Delete
                </button>
              </>
            )}
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
            href={`/dashboard/mycontracts/draft/${encodeURIComponent(contractId)}/riskdetect`}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 text-blue-600 bg-blue-100 px-4 py-2 text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            <ShieldAlert size={16} />
            Risk Detect
          </Link>
        </div>
      </div>

      {finance && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Finance</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-bold text-xl">{new Intl.NumberFormat('en-US', { style: 'currency', currency: finance.currency || 'USD' }).format(finance.totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="font-bold text-xl text-green-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: finance.currency || 'USD' }).format(finance.paidAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Amount</p>
              <p className="font-bold text-xl text-orange-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: finance.currency || 'USD' }).format(finance.dueAmount)}</p>
            </div>
          </div>
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

            {data.versionHistory && data.versionHistory.length > 0 && (
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setShowDiff(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${!showDiff ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}
                >
                  Current Version
                </button>
                <button
                  onClick={() => setShowDiff(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${showDiff ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}
                >
                  View Changes
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          {showDiff && data.versionHistory && data.versionHistory.length > 0 ? (
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
