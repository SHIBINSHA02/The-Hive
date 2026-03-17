"use client";

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  FileSearch, 
  ChevronDown, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  BrainCircuit,
  Scale
} from 'lucide-react';
import { processContractFile } from '@/lib/contractExtraction';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type AnalysisResult = {
  executive_summary?: string;
  important_clauses?: any[];
  key_highlights?: any[];
  uncertainties_and_risks?: any[];
};

export default function OtherPage() {
  const [role, setRole] = useState<'Client' | 'Contractor'>('Client');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentSectionContent, setCurrentSectionContent] = useState("");
  const [synthesizedData, setSynthesizedData] = useState<AnalysisResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['executive_summary']));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const extractJson = (text: string) => {
    try {
      // 1. Find the outermost braces
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      
      if (start === -1) return null;

      let jsonStr = "";
      
      if (end !== -1 && end > start) {
        // We have a full (or seemingly full) object
        jsonStr = text.substring(start, end + 1);
      } else {
        // Potentially truncated JSON - try to "auto-close" it
        // This is highly experimental for streaming
        jsonStr = text.substring(start);
        
        // Basic truncation repair for simple structures
        // Count braces/brackets
        const openBrace = (jsonStr.match(/\{/g) || []).length;
        const closeBrace = (jsonStr.match(/\}/g) || []).length;
        const openBracket = (jsonStr.match(/\[/g) || []).length;
        const closeBracket = (jsonStr.match(/\]/g) || []).length;

        // If we're missing exactly one closing brace and we just ended mid-string or mid-value
        if (openBrace > closeBrace) {
           // If it ends with a comma, it was likely an array/object element
           if (jsonStr.trim().endsWith(',')) {
              jsonStr = jsonStr.trim().slice(0, -1);
           }
           // Try to close what's open
           jsonStr += "}".repeat(openBrace - closeBrace);
        }
      }

      // 2. Clean common issues
      jsonStr = jsonStr
        .replace(/,\s*([\]\}])/g, '$1') // Trailing commas
        .replace(/[\u0000-\u001F]+/g, ""); // Control characters

      return JSON.parse(jsonStr);
    } catch (e) {
      // If still failing, try a very basic match as last resort
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
    if (!file) return;

    setIsAnalyzing(true);
    setSynthesizedData(null);
    setCurrentSectionContent("");
    setProgress(0);
    setLoadingText("Extracting text from document...");

    try {
      const formData = new FormData();
      formData.append('file', file);
      const extractedText = await processContractFile(formData);

      if (!extractedText) throw new Error("Could not extract text");

      setLoadingText("Initializing AI Analysis...");
      
      const response = await fetch('/api/ai/analyze-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText, role }),
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
        
        // Handle custom protocol messages
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-white/50 min-h-screen rounded-2xl shadow-sm border border-slate-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Scale className="w-8 h-8 text-blue-600" />
            AI Legal Contract Analyzer
          </h1>
          <p className="text-slate-500 mt-2">Professional-grade deep analysis for complex legal agreements.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          {(['Client', 'Contractor'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                role === r 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              For {r}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer group relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 transition-all ${
              file ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.txt"
            />
            {file ? (
              <>
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg mb-4 text-white">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="font-semibold text-slate-900 text-center truncate w-full">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-4 text-xs font-medium text-red-500 hover:underline"
                >
                  Change File
                </button>
              </>
            ) : (
              <>
                <div className="bg-slate-100 group-hover:bg-blue-100 p-4 rounded-2xl transition-colors mb-4">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                </div>
                <p className="font-medium text-slate-900">Upload contract</p>
                <p className="text-sm text-slate-400 mt-1">PDF or TXT (Max 10MB)</p>
              </>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
              !file || isAnalyzing 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-linear-to-r from-blue-600 to-blue-700 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 fill-current" />
            )}
            {isAnalyzing ? "Processing..." : "Analyze Contract"}
          </button>
        </div>

        {/* Status / Live Feed Area */}
        <div className="md:col-span-2">
          <div className="bg-slate-900 rounded-3xl p-6 h-full min-h-[300px] shadow-xl overflow-hidden relative border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Live Engine Output</span>
              </div>
              {isAnalyzing && (
                <div className="text-xs font-mono text-blue-400">{Math.round(progress)}%</div>
              )}
            </div>
            
            <div className="font-mono text-sm text-blue-300 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
              {loadingText && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-white">{loadingText}</span>
                </div>
              )}
              {currentSectionContent && (
                <div className="text-indigo-200/60 transition-opacity">
                  {currentSectionContent.slice(-200)}
                  <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-pulse" />
                </div>
              )}
              {!isAnalyzing && !loadingText && progress === 0 && (
                <div className="text-slate-600 italic">Ready for document ingestion...</div>
              )}
            </div>

            {/* Visualizer Background */}
            <div className="absolute inset-0 pointer-events-none opacity-5 flex items-end justify-center overflow-hidden">
               <div className="flex gap-1 items-end h-full">
                  {[...Array(40)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 transition-all duration-300 rounded-t ${isAnalyzing ? 'bg-blue-500' : 'bg-blue-800'}`} 
                      style={{ height: `${Math.random() * 80 + 20}%`, opacity: Math.random() }}
                    />
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synthesized Results Dashboard */}
      {(synthesizedData || isAnalyzing) && (
        <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Expert Review Insights</h2>
          </div>

          <div className="space-y-4">
            {/* Executive Summary */}
            <Section 
              id="executive_summary"
              title="Executive Summary"
              icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
              content={synthesizedData?.executive_summary}
              isOpen={expandedSections.has('executive_summary')}
              onToggle={() => toggleSection('executive_summary')}
            />

            {/* Important Clauses */}
            <Section 
              id="important_clauses"
              title="Important Clauses"
              icon={<FileSearch className="w-5 h-5 text-blue-500" />}
              content={synthesizedData?.important_clauses}
              isOpen={expandedSections.has('important_clauses')}
              onToggle={() => toggleSection('important_clauses')}
            />

            {/* Key Highlights */}
            <Section 
              id="key_highlights"
              title="Key Highlights"
              icon={<Zap className="w-5 h-5 text-amber-500" />}
              content={synthesizedData?.key_highlights}
              isOpen={expandedSections.has('key_highlights')}
              onToggle={() => toggleSection('key_highlights')}
            />

            {/* Risks & Uncertainties */}
            <Section 
              id="uncertainties_and_risks"
              title="Uncertainties & Risks"
              icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
              content={synthesizedData?.uncertainties_and_risks}
              isOpen={expandedSections.has('uncertainties_and_risks')}
              onToggle={() => toggleSection('uncertainties_and_risks')}
            />
          </div>

          {/* Full JSON Export - Compact */}
          {synthesizedData && (
            <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Raw Synthesis (Internal View)</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(synthesizedData, null, 2))}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Copy JSON
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-600 overflow-x-auto p-4 bg-white rounded-xl border border-slate-200">
                {JSON.stringify(synthesizedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

function Section({ id, title, icon, content, isOpen, onToggle }: any) {
  if (!content) return null;

  return (
    <div className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isOpen ? 'border-blue-200 bg-blue-50/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
      <button 
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-white shadow-sm' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
            {icon}
          </div>
          <span className="font-bold text-slate-800">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-2 animate-in fade-in duration-300">
          <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-li:font-medium prose-strong:text-indigo-600">
            {Array.isArray(content) ? (
              <ul className="space-y-3">
                {content.map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                    <span>
                      {typeof item === 'string' 
                        ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{item}</ReactMarkdown>
                        : typeof item === 'object' && item !== null 
                          ? Object.entries(item).map(([k, v]) => (
                              <div key={k} className="mb-2">
                                <span className="font-bold text-blue-600 mr-2">{k}:</span>
                                <div className="inline">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(v)}</ReactMarkdown>
                                </div>
                              </div>
                            ))
                          : String(item)
                      }
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-700 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(content)}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}