"use client";

import React, { useState, useEffect, use } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  FileSearch, 
  ChevronDown, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  BrainCircuit,
  Scale,
  ArrowLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

type AnalysisResult = {
  executive_summary?: string;
  important_clauses?: any[];
  key_highlights?: any[];
  uncertainties_and_risks?: any[];
};

interface PageProps {
  params: Promise<{ contractname: string }>;
}

export default function RiskDetectPage({ params }: PageProps) {
  const { contractname: contractId } = use(params);
  const [role, setRole] = useState<'Client' | 'Contractor'>('Client');
  const [contract, setContract] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentSectionContent, setCurrentSectionContent] = useState("");
  const [synthesizedData, setSynthesizedData] = useState<AnalysisResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['executive_summary']));
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setFetchLoading(true);
        const res = await fetch(`/api/contracts/${contractId}`);
        if (!res.ok) throw new Error("Failed to fetch contract data");
        const data = await res.json();
        setContract(data.contract);
      } catch (err: any) {
        setFetchError(err.message || "An error occurred while fetching the contract.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const extractJson = (text: string) => {
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      
      if (start === -1) return null;

      let jsonStr = "";
      
      if (end !== -1 && end > start) {
        jsonStr = text.substring(start, end + 1);
      } else {
        jsonStr = text.substring(start);
        
        const openBrace = (jsonStr.match(/\{/g) || []).length;
        const closeBrace = (jsonStr.match(/\}/g) || []).length;

        if (openBrace > closeBrace) {
           if (jsonStr.trim().endsWith(',')) {
              jsonStr = jsonStr.trim().slice(0, -1);
           }
           jsonStr += "}".repeat(openBrace - closeBrace);
        }
      }

      jsonStr = jsonStr
        .replace(/,\s*([\]\}])/g, '$1') 
        .replace(/[\u0000-\u001F]+/g, ""); 

      return JSON.parse(jsonStr);
    } catch (e) {
      const match = text.match(/(\{[\s\S]*\})/);
      if (match) {
        try {
          return JSON.parse(match[1].replace(/,\s*([\]\}])/g, '$1'));
        } catch (innerE) {
          console.error("JSON extraction failed even after repair attempt", innerE);
        }
      }
      return null;
    }
  };

  const mergeResults = (final: any, next: any) => {
    if (!final) return next;
    const merged = { ...final };
    for (const key in next) {
      if (!merged[key]) {
        merged[key] = next[key];
      } else if (Array.isArray(next[key])) {
        if (Array.isArray(merged[key])) {
          merged[key] = [...new Set([...merged[key], ...next[key]])];
        } else {
          merged[key] = next[key];
        }
      } else if (typeof next[key] === 'string') {
        if (typeof merged[key] === 'string' && !merged[key].includes(next[key])) {
          merged[key] += "\n" + next[key];
        } else {
          merged[key] = next[key];
        }
      } else if (typeof next[key] === 'object' && next[key] !== null) {
        merged[key] = mergeResults(merged[key], next[key]);
      }
    }
    return merged;
  };

  const handleAnalyze = async () => {
    if (!contract?.contractContent) return;

    setIsAnalyzing(true);
    setSynthesizedData(null);
    setCurrentSectionContent("");
    setProgress(0);
    setLoadingText("Initializing AI Analysis...");

    try {
      const response = await fetch('/api/ai/analyze-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: contract.contractContent, role }),
      });

      if (!response.ok || !response.body) throw new Error("API request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let chunkOutput = "";
      let tempSynthesized: AnalysisResult = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith("CHUNK_START:")) {
            const parts = line.split(':');
            const current = parseInt(parts[1]);
            const total = parseInt(parts[2]);
            setProgress((current / total) * 100);
            setLoadingText(`Analyzing section ${current} of ${total}...`);
            chunkOutput = "";
            setCurrentSectionContent("");
          } else if (line.startsWith("CHUNK_END")) {
            const jsonPart = extractJson(chunkOutput);
            if (jsonPart) {
              tempSynthesized = mergeResults(tempSynthesized, jsonPart);
              setSynthesizedData({ ...tempSynthesized });
            }
          } else if (line.startsWith("ERROR:")) {
            console.error(line);
          } else if (line.trim()) {
            chunkOutput += line;
            setCurrentSectionContent(prev => prev + line);
          }
        }
      }

      setLoadingText("Analysis complete ✓");
      setProgress(100);
    } catch (error) {
      console.error(error);
      setLoadingText("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading contract details...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-red-700 font-medium">{fetchError}</p>
        </div>
        <Link 
            href={`/dashboard/mycontracts/draft/${contractId}`}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
            <ArrowLeft className="w-4 h-4" />
            Back to Contract
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-white/50 min-h-screen rounded-2xl shadow-sm border border-slate-100 mb-20 md:mb-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-4">
          <Link 
            href={`/dashboard/mycontracts/draft/${contractId}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {contract?.contractTitle || "Contract"}
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Scale className="w-8 h-8 text-blue-600" />
                Risk Detection
            </h1>
            <p className="text-slate-500 mt-2">AI-powered vulnerability & compliance analysis for your contract.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 w-fit">
          {(['Client', 'Contractor'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                role === r 
                ? 'bg-white text-blue-600 shadow-sm scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              For {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Contract Info & Action */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
               <div className="bg-blue-100 p-2.5 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
               </div>
               <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contract Name</p>
                  <p className="font-bold text-slate-900 truncate">{contract?.contractTitle}</p>
               </div>
            </div>
            
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Analysis Scope</p>
               <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">Legal Compliance</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">Financial Risk</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">Term Exposure</span>
               </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !contract?.contractContent}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 mt-4 ${
                isAnalyzing || !contract?.contractContent
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-linear-to-r from-blue-600 to-blue-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-blue-200'
              }`}
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 fill-current" />
              )}
              {isAnalyzing ? "Analyzing..." : "Start Deep Analysis"}
            </button>
            {!contract?.contractContent && (
               <p className="text-xs text-rose-500 font-medium text-center italic">No contract content found to analyze.</p>
            )}
          </div>
          
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
             <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="space-y-1">
                   <p className="text-sm font-bold text-amber-900 leading-none">Security Note</p>
                   <p className="text-xs text-amber-700 leading-relaxed">
                      Our AI analysis is a supplementary tool and does not constitute legal advice. Always consult with qualified legal counsel for critical decisions.
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Live Output & Insights */}
        <div className="md:col-span-2 space-y-6">
           {/* Live Feed Terminal */}
           <div className="bg-slate-950 rounded-3xl p-6 h-[280px] shadow-2xl overflow-hidden relative border border-slate-800 group">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${isAnalyzing ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Analysis Engine Status</span>
              </div>
              {isAnalyzing && (
                <div className="text-xs font-mono text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">{Math.round(progress)}% OCR-LLM</div>
              )}
            </div>
            
            <div className="font-mono text-xs text-blue-300/80 space-y-3 h-[180px] overflow-y-auto custom-scrollbar relative z-10 px-1">
              {loadingText && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className="text-white font-medium">{loadingText}</span>
                </div>
              )}
              {currentSectionContent && (
                <div className="text-indigo-200/50 transition-opacity leading-relaxed">
                  {currentSectionContent.slice(-300)}
                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                </div>
              )}
              {!isAnalyzing && !loadingText && progress === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-2 italic">
                    <BrainCircuit className="w-8 h-8 opacity-20" />
                    <p>Analysis engine ready for initialization...</p>
                </div>
              )}
            </div>

            {/* Visualizer Effect Background */}
            <div className="absolute bottom-0 inset-x-0 pointer-events-none opacity-[0.03] flex items-end justify-center overflow-hidden h-32">
               <div className="flex gap-1.5 items-end h-full w-full px-4">
                  {[...Array(60)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 transition-all duration-500 rounded-t ${isAnalyzing ? 'bg-blue-400' : 'bg-slate-600'}`} 
                      style={{ 
                        height: isAnalyzing ? `${Math.random() * 90 + 10}%` : '4%', 
                        opacity: isAnalyzing ? Math.random() * 0.8 + 0.2 : 0.5 
                      }}
                    />
                  ))}
               </div>
            </div>
          </div>

          {/* Synthesized Results Dashboard */}
          {(synthesizedData || isAnalyzing) && (
            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-slate-900 italic tracking-tight underline decoration-blue-200 underline-offset-8">Counsel Intelligence Insights</h2>
                </div>
                {synthesizedData && (
                    <button 
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(synthesizedData, null, 2))}
                        className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"
                    >
                        Copy Report
                    </button>
                )}
              </div>

              <div className="space-y-4">
                <Section 
                  id="executive_summary"
                  title="Executive Summary"
                  icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
                  content={synthesizedData?.executive_summary}
                  isOpen={expandedSections.has('executive_summary')}
                  onToggle={() => toggleSection('executive_summary')}
                />

                <Section 
                  id="important_clauses"
                  title="Important Clauses"
                  icon={<FileSearch className="w-5 h-5 text-blue-500" />}
                  content={synthesizedData?.important_clauses}
                  isOpen={expandedSections.has('important_clauses')}
                  onToggle={() => toggleSection('important_clauses')}
                />

                <Section 
                  id="key_highlights"
                  title="Key Highlights"
                  icon={<Zap className="w-5 h-5 text-amber-500" />}
                  content={synthesizedData?.key_highlights}
                  isOpen={expandedSections.has('key_highlights')}
                  onToggle={() => toggleSection('key_highlights')}
                />

                <Section 
                  id="uncertainties_and_risks"
                  title="Uncertainties & Risks"
                  icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
                  content={synthesizedData?.uncertainties_and_risks}
                  isOpen={expandedSections.has('uncertainties_and_risks')}
                  onToggle={() => toggleSection('uncertainties_and_risks')}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw JSON for reference if needed */}
      {synthesizedData && (
        <div className="mt-16 p-8 bg-slate-50 rounded-[40px] border border-slate-200/60 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-[2] pointer-events-none">
                <Scale className="w-32 h-32" />
           </div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Full Systematic Synthesis</span>
          </div>
          <pre className="text-[11px] font-mono text-slate-500 overflow-x-auto p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-inner">
            {JSON.stringify(synthesizedData, null, 2)}
          </pre>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}

function Section({ id, title, icon, content, isOpen, onToggle }: any) {
  if (!content) return null;

  return (
    <div className={`overflow-hidden rounded-[2.5rem] border-2 transition-all duration-500 ${
        isOpen 
        ? 'border-blue-100 bg-linear-to-b from-blue-50/20 to-transparent shadow-xl shadow-blue-500/5' 
        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
    }`}>
      <button 
        onClick={onToggle}
        className="w-full px-8 py-6 flex items-center justify-between group"
      >
        <div className="flex items-center gap-5">
          <div className={`p-3 rounded-2xl transition-all duration-500 ${
              isOpen 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-110' 
              : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
          }`}>
            {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { 
                className: `${(icon.props as any).className || ''} ${isOpen ? 'text-white' : ''}`.trim()
            })}
          </div>
          <span className={`font-bold text-lg tracking-tight transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-700'}`}>{title}</span>
        </div>
        <div className={`p-2 rounded-full transition-all duration-500 ${isOpen ? 'bg-blue-50 rotate-180' : 'bg-slate-50'}`}>
            <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`} />
        </div>
      </button>
      
      {isOpen && (
        <div className="px-10 pb-10 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="prose prose-slate prose-lg max-w-none prose-p:leading-relaxed prose-li:font-medium prose-strong:text-blue-600 prose-headings:font-bold prose-headings:tracking-tight">
            {Array.isArray(content) ? (
              <ul className="space-y-4">
                {content.map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-600 group/item">
                    <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-400 transition-transform group-hover/item:scale-150" />
                    <div className="flex-1">
                      {typeof item === 'string' 
                        ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{item}</ReactMarkdown>
                        : typeof item === 'object' && item !== null 
                          ? Object.entries(item).map(([k, v]) => (
                              <div key={k} className="mb-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest block mb-2">{k}</span>
                                <div className="text-slate-700 font-medium">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(v)}</ReactMarkdown>
                                </div>
                              </div>
                            ))
                          : String(item)
                      }
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-700 leading-relaxed font-medium bg-slate-50/30 p-6 rounded-3xl border border-blue-50/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(content)}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
