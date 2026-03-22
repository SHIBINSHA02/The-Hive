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
          <div className="flex flex-col items-center justify-center text-center py-20 w-full max-w-[210mm] border border-slate-200 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-pulse">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
               <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-bold tracking-tight text-lg mb-2">Ready to Draft</h3>
            <p className="text-slate-400 text-sm max-w-[240px] leading-relaxed mx-auto italic">
              Begin typing in the forms to watch your professional instrument take shape here.
            </p>
          </div>
        ) : (
          <div className="relative w-full max-w-[210mm] min-h-[min(800px,calc(100vh-200px))] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-200 rounded-sm p-8 sm:p-14 animate-in fade-in zoom-in-95 duration-500 overflow-hidden group">
            
            {/* PAPER DECOR - Top left corner fold feeling */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-slate-50 to-transparent opacity-50 pointer-events-none" />
            
            <div 
              className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-800 font-serif leading-relaxed"
              dangerouslySetInnerHTML={{ __html: liveHtmlPreview }} 
            />

            {/* LIVE INDICATOR */}
            <div className="absolute bottom-4 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
               </span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Draft</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}