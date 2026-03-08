"use client";

/**
 * LivePreview.tsx
 * ---------------
 * This component acts as a "Real-Time Mirror" of the contract data.
 * It consumes the ContractContext to show a live rendered document of what has been filled.
 * * * DESIGN UPDATE: Now utilizes the deterministic generator.ts engine to render 
 * a 1:1 WYSIWYG (What You See Is What You Get) A4 paper preview.
 */

import { useMemo } from "react";
import { useContract } from "@/app/(protected)/dashboard/mycontracts/create-contract/_context/ContractContext";

// Ensure this path points correctly to your generator engine
import { generateContract } from "@/lib/contract-templates/service-agreement/generator"; 

export function LivePreview() {
  // 1. Pull current form state and template metadata from Context
  const { formData, template, selectedClauses } = useContract();

  // 2. Logic: Check if the user has started typing anything at all
  // We use .some() to check if at least one value in formData is truthy
  const hasData = Object.values(formData).some((val) => val && String(val).trim() !== "");

  // 3. Logic: Generate the real-time HTML string using the deterministic engine
  const liveHtmlPreview = useMemo(() => {
    if (!hasData) return "";

    try {
      // We pass isDraft: true so validation errors don't crash the preview
      // This allows the UI to render incomplete contracts during editing safely.
      const rawText = generateContract({
        placeholderValues: formData,
        selectedOptionalClauses: selectedClauses,
        isDraft: true, 
      });

      // Format the raw legal structure into HTML paragraphs for the UI
      let formattedHtml = rawText
        .split("\n\n")
        .map(paragraph => `<p class="mb-4 text-justify leading-relaxed">${paragraph}</p>`)
        .join("");

      // Make the [MISSING: KEY] tokens visually glow yellow for the user
      // so they know exactly what fields are still required.
      formattedHtml = formattedHtml.replace(
        /\[MISSING:\s*([^\]]+)\]/g,
        `<span class="bg-yellow-200 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded shadow-sm mx-1 align-baseline border border-yellow-300">$1</span>`
      );

      // Prepend the official Document Title based on the template config
      const header = `<h1 class="text-center text-xl sm:text-2xl font-bold mb-8 uppercase tracking-wide border-b-2 border-gray-900 pb-4">
        ${template.templateConfig.name || "Legal Agreement"}
      </h1>`;

      return header + formattedHtml;

    } catch (error) {
      console.error("Preview Generation Error:", error);
      return `<div class="p-4 bg-red-50 text-red-600 rounded border border-red-200">Failed to render preview.</div>`;
    }
  }, [formData, selectedClauses, template, hasData]);


  return (
    <div className="flex flex-col h-full bg-gray-200/50 rounded-xl overflow-hidden border border-gray-200">
      
      {/* HEADER: Displays the specific contract type name from the Registry */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          Live Document Preview
        </h2>
        <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200">
          {template.templateConfig.name}
        </span>
      </div>

      {/* SCROLLABLE DESK AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center custom-scrollbar">
        
        {!hasData ? (
          /* EMPTY STATE: Shown when no data has been entered yet */
          <div className="flex flex-col items-center justify-center text-center py-20 w-full max-w-[210mm] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm italic">
              Waiting for data... <br /> Fill out the forms on the left to build the document.
            </p>
          </div>
        ) : (
          /* ACTIVE STATE: Fades in as data is populated and renders the A4 Paper container */
          <div 
            className="bg-white shadow-2xl ring-1 ring-gray-900/5 w-full max-w-[210mm] min-h-[297mm] p-[15mm] sm:p-[20mm] text-black font-serif transition-all duration-500 animate-in fade-in zoom-in-95"
          >
            {/* The actual injected HTML generated by the deterministic engine */}
            <div 
              className="prose prose-sm sm:prose-base max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: liveHtmlPreview }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}