"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useContract } from "../_context/ContractContext";
import { Loader2, FileText, ChevronLeft, Download } from "lucide-react";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  const { template, formData, selectedClauses } = useContract();
  const [isSaving, setIsSaving] = useState(false);

  /**
   * 1. ASSEMBLE THE CONTRACT
   * We use useMemo to generate the full text. 
   * Since we updated generator.ts to support 'isDraft', this won't crash 
   * even if some fields are missing.
   */
  const fullContractText = useMemo(() => {
    if (!template) return "";
    return template.generateContract({
      placeholderValues: formData,
      selectedOptionalClauses: selectedClauses,
      isDraft: true,
    });
  }, [template, formData, selectedClauses]);

  /**
   * 2. FINAL GENERATION & SAVE
   * This sends the data to your (soon to be built) API to 
   * save it in the database and potentially generate a PDF.
   */
  const handleFinalize = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/contract/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractType: type,
          formData,
          selectedClauses,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/mycontracts?status=created");
      }
    } catch (error) {
      console.error("Failed to save contract", error);
      alert("Error saving contract. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!template) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Final Review
          </h1>
          <p className="text-sm text-gray-500">
            Review the full legal text before finalizing your agreement.
          </p>
        </div>
      </div>

      {/* THE CONTRACT DOCUMENT VIEWER */}
      {/* We use a specific 'paper' look here to distinguish it from a form */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden min-h-[600px] flex flex-col">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Draft Version</span>
          <span>{template.templateConfig.name}</span>
        </div>
        
        <div className="p-12 flex-1 overflow-y-auto bg-[white]">
          {/* whitespace-pre-wrap is essential to respect the \n line breaks */}
          <div className="max-w-2xl mx-auto text-gray-800 leading-relaxed font-serif whitespace-pre-wrap text-sm">
            {fullContractText}
          </div>
        </div>
      </div>

      {/* NAVIGATION FOOTER */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Edit
        </button>

        <button
          onClick={handleFinalize}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Finalize & Save
        </button>
      </div>
    </div>
  );
}