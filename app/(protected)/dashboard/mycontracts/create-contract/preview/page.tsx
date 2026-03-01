"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useContract } from "../_context/ContractContext";
import { Loader2, FileText, ChevronLeft, Download, CheckCircle, Save } from "lucide-react";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  // Grab everything from our context, including the new resetForm for persistence cleanup
  const { template, formData, selectedClauses, resetForm } = useContract();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 1. LIVE PREVIEW ASSEMBLY (Draft Mode)
   * This displays the contract with [MISSING] tags for any empty fields.
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
   * 2. DOWNLOAD PDF LOGIC
   * Fetches clean text from the backend and renders it to a PDF file.
   */
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
      // Styling specifically for the PDF print output
      element.innerHTML = `
        <div style="font-family: 'Times New Roman', serif; padding: 50px; line-height: 1.6; color: black; background: white;">
          <h1 style="text-align: center; text-transform: uppercase; margin-bottom: 30px;">${title}</h1>
          <div style="white-space: pre-wrap;">${fullText}</div>
        </div>
      `;

      const opt = {
        margin: 0.75,
        filename: `${title.replace(/\s+/g, "_")}_Final.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();

    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      alert("Error generating PDF. Please ensure all required fields are filled.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 3. DATABASE SAVE LOGIC
   * Saves the clean contract to MongoDB and clears the local draft session.
   */
  const handleSaveToDatabase = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/contract/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contractType: type, 
          formData, 
          selectedClauses 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save contract to database.");
      }

      // --- CRITICAL: PERSISTENCE CLEANUP ---
      // This wipes the localStorage draft so the next contract starts fresh.
      resetForm(); 

      // Redirect to dashboard and refresh data
      router.refresh(); 
      router.push("/dashboard/mycontracts?status=created");

    } catch (error: any) {
      console.error("Database Save Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!template) return null;

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Final Review
          </h1>
          <p className="text-sm text-gray-500">
            Review your document carefully. Once saved, it will appear in your dashboard.
          </p>
        </div>
      </div>

      {/* DOCUMENT PREVIEW BOX */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden min-h-[650px] flex flex-col">
        {/* Top Status Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3 text-green-500" /> 
            Live Draft Preview
          </span>
          <span>{template.templateConfig.name}</span>
        </div>
        
        {/* Legal Text Content */}
        <div className="p-12 flex-1 overflow-y-auto bg-white">
          <div className="max-w-2xl mx-auto text-gray-800 leading-relaxed font-serif whitespace-pre-wrap text-sm">
            {fullContractText}
          </div>
        </div>
      </div>

      {/* NAVIGATION & ACTION FOOTER */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Editing
        </button>

        <div className="flex gap-3">
          {/* SAVE BUTTON */}
          <button 
            onClick={handleSaveToDatabase}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save to Dashboard
          </button> 

          {/* DOWNLOAD PDF BUTTON */}
          <button
            onClick={handleDownloadPDF}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}