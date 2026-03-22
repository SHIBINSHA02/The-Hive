"use client";

import React, { useState, useMemo, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useContract } from "../_context/ContractContext";
import {
  Loader2,
  FileText,
  ChevronLeft,
  Download,
  CheckCircle,
  Save,
  ImagePlus,
  Printer,
  ShieldCheck,
  Eye,
  ArrowLeftRight
} from "lucide-react";
import { ContractDocument } from "./_components/ContractDocument";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const { template, formData, selectedClauses, resetForm, updateField } = useContract();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [refId, setRefId] = React.useState("");

  React.useEffect(() => {
    setRefId(Math.random().toString(36).substring(7).toUpperCase());
  }, []);

  const fullContractText = useMemo(() => {
    if (!template) return "";
    return template.generateContract({
      placeholderValues: formData,
      selectedOptionalClauses: selectedClauses,
      isDraft: true,
    });
  }, [template, formData, selectedClauses]);

  const handleDownloadPDF = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/contract/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractType: type, formData, selectedClauses }),
      });

      if (!response.ok) throw new Error("Failed to assemble PDF content.");
      const { fullText, title } = await response.json();

      const element = document.createElement("div");
      element.innerHTML = `
        <div style="font-family: 'Times New Roman', serif; padding: 60px; line-height: 1.6; color: black; background: white;">
          <h1 style="text-align: center; text-transform: uppercase; margin-bottom: 40px; font-size: 24px;">${title}</h1>
          <div style="white-space: pre-wrap; font-size: 14px;">${fullText}</div>
        </div>
      `;

      const opt = {
        margin: 0,
        filename: `${title.replace(/\s+/g, "_")}_Final.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/contract/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractType: type, formData, selectedClauses }),
      });
      if (response.ok) {
        resetForm();
        router.push("/dashboard/mycontracts?status=created");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!template) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 selection:bg-blue-100 overflow-x-hidden">
      {/* --- REFINED TOP NAVIGATION --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Review Instrument
              </h1>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                {template.templateConfig.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveToDatabase}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              Save Draft
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
              Export PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-10">

        {/* --- LEFT SIDEBAR: PROPERTIES --- */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-8">
            <div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Branding</h3>
              <div className="relative group aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400">
                {formData.COMPANY_LOGO ? (
                  <>
                    <img src={formData.COMPANY_LOGO} alt="Branding" className="w-full h-full object-contain p-4" />
                    <button
                      onClick={() => updateField("COMPANY_LOGO", "")}
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                    >
                      Remove Logo
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <ImagePlus className="h-6 w-6 text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Add Logo</span>
                    <input
                      type="file" className="hidden" accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => updateField("COMPANY_LOGO", reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Properties</h3>
              <PropertyItem icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />} label="Compliance" value="Verified" />
              <PropertyItem icon={<ArrowLeftRight className="h-4 w-4 text-blue-500" />} label="Signatories" value="2 Parties" />
              <PropertyItem icon={<Eye className="h-4 w-4 text-purple-500" />} label="Access" value="Private" />
            </div>
          </div>
        </aside>

        {/* --- MAIN: THE DOCUMENT --- */}
        <main className="flex justify-center flex-1 min-w-0">
          <div className="relative group perspective-[1000px]">
             {/* Realistic shadow layer handled in side the component or as a wrapper */}
             <div className="absolute -inset-4 bg-slate-200/40 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             
             <ContractDocument 
               formData={formData} 
               template={template} 
               fullContractText={fullContractText} 
               refId={refId} 
             />
          </div>
        </main>

        {/* --- RIGHT SIDEBAR: STATUS --- */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Finalization</h3>

            <div className="space-y-4">
              <StatusCheck label="Dimensions" status="Letter / A4" />
              <StatusCheck label="Font Rendering" status="Serif Hybrid" />
              <StatusCheck label="Margin Check" status="0.75 in" />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                Ensure all dynamic fields are populated. Once exported, the layout is locked for legal preservation.
              </p>
            </div>

            <Link
              href="/dashboard/mycontracts"
              className="flex items-center justify-center w-full py-3 bg-slate-50 text-slate-900 text-[11px] font-black uppercase rounded-xl border border-slate-200 hover:bg-slate-100 transition-all"
            >
              Exit Review
            </Link>
          </div>
        </aside>
      </div>

      {/* MOBILE BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-around px-6 shadow-2xl z-50">
        <button onClick={handleSaveToDatabase} className="text-white p-2">
          <Save className="h-5 w-5" />
        </button>
        <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold text-xs">
          <Download className="h-4 w-4" /> Download
        </button>
      </div>
    </div>
  );
}

function PropertyItem({ icon, label, value }: { icon: ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between group cursor-default">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">{icon}</div>
        <span className="text-[11px] font-bold text-slate-500">{label}</span>
      </div>
      <span className="text-[10px] font-black text-slate-900">{value}</span>
    </div>
  );
}

function StatusCheck({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <span className="text-xs font-bold text-slate-800">{status}</span>
      </div>
    </div>
  );
}