"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Save, 
  X, 
  Loader2, 
  ArrowLeft, 
  Type, 
  Building2, 
  Calendar, 
  FileText, 
  ListChecks,
  AlertCircle,
  Clock,
  Mail,
  IndianRupee,
  Milestone,
  Plus as PlusIcon,
  Trash
} from "lucide-react";
import { Contract } from "@/types/contract";
import Link from "next/link";

export default function EditDraftPage() {
  const { contractname } = useParams();
  const contractId = decodeURIComponent(contractname as string);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [formData, setFormData] = useState<Partial<Contract>>({
    contractTitle: "",
    companyName: "",
    summary: "",
    contractContent: "",
    startDate: "",
    deadline: "",
    partyB_Email: "",
    keypoints: [],
    clauses: []
  });

  const [finance, setFinance] = useState({
    totalAmount: 0,
    currency: "USD",
    milestones: [] as { title: string; amount: number; dueDate: string; isPaid: boolean }[],
  });

  useEffect(() => {
    if (!contractId) return;

    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/contracts/${contractId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch contract");
        const json = await res.json();
        const c = json.contract;
        
        setFormData({
          contractTitle: c.contractTitle || "",
          companyName: c.companyName || "",
          summary: c.summary || "",
          contractContent: c.contractContent || "",
          startDate: c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : "",
          deadline: c.deadline ? new Date(c.deadline).toISOString().split('T')[0] : "",
          partyB_Email: c.partyB_Email || "",
          keypoints: c.keypoints || [],
          clauses: c.clauses || []
        });

        if (json.finance) {
          const f = json.finance;
          setFinance({
            totalAmount: f.totalAmount || 0,
            currency: f.currency || "USD",
            milestones: f.milestones?.map((m: any) => ({
                title: m.title || "",
                amount: m.amount || 0,
                dueDate: m.dueDate ? new Date(m.dueDate).toISOString().split('T')[0] : "",
                isPaid: m.isPaid || false
            })) || []
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load draft");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, finance })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save changes");
      }

      router.push(`/dashboard/mycontracts/draft/${contractId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading draft editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 mb-8">
        <div className="flex items-center justify-between px-4 sm:px-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Draft</h1>
              <p className="text-xs text-gray-500">Changes are saved to your private draft.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:bg-blue-400"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 sm:mx-0 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">
        {/* Left Column: Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
              <Building2 className="w-5 h-5 text-blue-600" />
              General Info
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Contract Title
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.contractTitle}
                    onChange={(e) => setFormData({...formData, contractTitle: e.target.value})}
                    placeholder="e.g. Software Development Agreement"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    placeholder="e.g. Acme Corp"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Counterparty Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.partyB_Email}
                    onChange={(e) => setFormData({...formData, partyB_Email: e.target.value})}
                    placeholder="client@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
              <Calendar className="w-5 h-5 text-blue-600" />
              Timeline
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
              <ListChecks className="w-5 h-5 text-blue-600" />
              Key Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Summary
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  rows={4}
                  placeholder="Provide a brief overview of the contract..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm resize-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-6">
            <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
              <IndianRupee className="w-5 h-5 text-blue-600" />
              Finance Overview
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Total Amount
                </label>
                <input
                  type="number"
                  value={finance.totalAmount}
                  onChange={(e) => setFinance({...finance, totalAmount: Number(e.target.value)})}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Currency
                </label>
                <select
                  value={finance.currency}
                  onChange={(e) => setFinance({...finance, currency: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm appearance-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Milestone className="w-4 h-4 text-blue-600" /> Payment Schedule
              </h3>
              <button 
                onClick={() => setFinance(f => ({ ...f, milestones: [...f.milestones, { title: "", amount: 0, dueDate: "", isPaid: false }] }))}
                className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
              >
                <PlusIcon className="w-3 h-3" /> Add
              </button>
            </div>
            
            <div className="space-y-3">
              {finance.milestones.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">No milestones added yet.</p>
              ) : (
                finance.milestones.map((m, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2 relative group">
                    <button 
                      onClick={() => setFinance(f => ({...f, milestones: f.milestones.filter((_, i) => i !== idx)}))}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <input 
                        type="text" 
                        value={m.title} 
                        onChange={e => {
                          const newM = [...finance.milestones];
                          newM[idx].title = e.target.value;
                          setFinance({...finance, milestones: newM});
                        }}
                        placeholder="Milestone Title" 
                        className="w-[90%] bg-transparent border-b border-gray-300 text-sm font-semibold outline-none focus:border-blue-500 pb-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-1 cursor-text">
                      <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1.5 rounded-lg">
                        <span className="text-xs text-gray-500 font-medium w-full max-w-[20px] truncate">{finance.currency === "INR" ? "₹" : finance.currency === "GBP" ? "£" : finance.currency === "EUR" ? "€" : "$"}</span>
                        <input 
                          type="number" 
                          value={m.amount}
                          onChange={e => {
                            const newM = [...finance.milestones];
                            newM[idx].amount = Number(e.target.value);
                            setFinance({...finance, milestones: newM});
                          }}
                          className="w-full text-sm outline-none bg-transparent"
                        />
                      </div>
                      <input 
                        type="date" 
                        value={m.dueDate}
                        onChange={e => {
                          const newM = [...finance.milestones];
                          newM[idx].dueDate = e.target.value;
                          setFinance({...finance, milestones: newM});
                        }}
                        className="text-xs bg-white border border-gray-200 px-2 py-1.5 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Main Content */}
        <div className="lg:col-span-2">
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <h2 className="flex items-center gap-2 font-bold text-gray-900">
                <FileText className="w-5 h-5 text-blue-600" />
                Contract Content
              </h2>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded tracking-tighter uppercase">
                Markdown Supported
              </span>
            </div>
            
            <textarea
              value={formData.contractContent}
              onChange={(e) => setFormData({...formData, contractContent: e.target.value})}
              className="flex-1 w-full min-h-[600px] p-6 text-sm font-mono bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none leading-relaxed"
              placeholder="# Project Scope..."
            />
          </section>
        </div>
      </div>
    </div>
  );
}
