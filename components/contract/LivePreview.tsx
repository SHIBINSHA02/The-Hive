"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useContract } from "@/app/(protected)/dashboard/mycontracts/create-contract/_context/ContractContext";
import { generateContract } from "@/lib/contract-templates/service-agreement/generator"; 

export function LivePreview() {
  const { formData, template, selectedClauses } = useContract();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // ADDED: TRACK CURRENTLY UPDATING FIELD
  // ==========================================
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const prevFormData = useRef<Record<string, any>>(formData);

  useEffect(() => {
    // 1. Compare new formData against old to find what just changed
    const allKeys = Array.from(new Set([...Object.keys(formData), ...Object.keys(prevFormData.current)]));
    const changedKey = allKeys.find(k => formData[k] !== prevFormData.current[k]);
    
    if (changedKey) {
      setActiveKey(changedKey);
    }
    
    prevFormData.current = formData;

  }, [formData]);


  const hasData = Object.values(formData).some((val) => val && String(val).trim() !== "");

  const liveHtmlPreview = useMemo(() => {
    if (!hasData) return "";

    try {
      // ==========================================
      // ADDED: INJECT HIGHLIGHT HTML
      // ==========================================
      // We clone the data so we don't accidentally save HTML tags to the real database
      const previewData = { ...formData };
      
      if (activeKey && previewData[activeKey] && String(previewData[activeKey]).trim() !== "") {
        previewData[activeKey] = `<span class="active-highlight bg-blue-200 text-blue-900 border border-blue-300 px-1 py-0.5 rounded shadow-sm transition-all duration-300">${previewData[activeKey]}</span>`;
      }

      // Generate text using our cloned, highlighted data
      const rawText = generateContract({
        placeholderValues: previewData,
        selectedOptionalClauses: selectedClauses,
        isDraft: true, 
      });

      let formattedHtml = rawText
        .split("\n\n")
        .map(paragraph => `<p class="mb-4 text-justify leading-relaxed">${paragraph}</p>`)
        .join("");

      // Still highlight the missing tokens in yellow
      formattedHtml = formattedHtml.replace(
        /\[MISSING:\s*([^\]]+)\]/g,
        `<span class="missing-token bg-yellow-200 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded shadow-sm mx-1 align-baseline border border-yellow-300">$1</span>`
      );

      const logoHtml = formData.COMPANY_LOGO 
        ? `<div class="flex justify-center mb-6"><img src="${formData.COMPANY_LOGO}" alt="Company Logo" class="max-h-24 object-contain" /></div>` 
        : "";

      const header = `${logoHtml}<h1 class="text-center text-xl sm:text-2xl font-bold mb-8 uppercase tracking-wide border-b-2 border-gray-900 pb-4">
        ${template.templateConfig.name || "Legal Agreement"}
      </h1>`;

      return header + formattedHtml;

    } catch (error) {
      console.error("Preview Generation Error:", error);
      return `<div class="p-4 bg-red-50 text-red-600 rounded border border-red-200">Failed to render preview.</div>`;
    }
  }, [formData, selectedClauses, template, hasData, activeKey]);

  // ==========================================
  // UPDATED: AUTO-SCROLL ENGINE
  // ==========================================
  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      if (scrollContainerRef.current) {
        // Look for the active typing highlight first. If not found, look for the next missing token.
        const targetElement = 
          scrollContainerRef.current.querySelector('.active-highlight') || 
          scrollContainerRef.current.querySelector('.missing-token');
        
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [liveHtmlPreview]); 


  return (
    <div className="flex flex-col h-full bg-gray-200/50 rounded-xl overflow-hidden border border-gray-200">
      
      {/* HEADER */}
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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center custom-scrollbar scroll-smooth">
        
        {!hasData ? (
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
          <div 
            className="bg-white shadow-2xl ring-1 ring-gray-900/5 w-full max-w-[210mm] min-h-[297mm] p-[15mm] sm:p-[20mm] text-black font-serif transition-all duration-500 animate-in fade-in zoom-in-95 relative"
            style={{ 
              backgroundImage: formData.BACKGROUND_IMAGE ? `url(${formData.BACKGROUND_IMAGE})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: formData.BACKGROUND_IMAGE ? 'rgba(255, 255, 255, 0.85)' : 'white',
              backgroundBlendMode: 'overlay',
            }}
          >
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