"use client";

import { useState, useEffect } from "react";
import { 
  UploadCloud, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2,
  ChevronRight,
  Info
} from "lucide-react";

// Matches the MongoDB IRiskReport schema we created
interface Risk {
  _id?: string;
  clause: string;
  issue: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

interface RiskReport {
  _id: string;
  fileName: string;
  extractedText: string;
  riskScore: number;
  risks: Risk[];
  createdAt: string;
}

export default function UploadAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState<RiskReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<RiskReport | null>(null);

  // Fetch past analysis history on load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/upload/analyze");
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    fetchHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const newReport: RiskReport = await res.json();
      
      // Add the new report to the top of the history list and select it
      setHistory((prev) => [newReport, ...prev]);
      setSelectedReport(newReport);
      setFile(null); // Reset the file input
      
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-amber-500';
    return 'text-rose-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* ---------------- LEFT SIDEBAR: UPLOAD & HISTORY ---------------- */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            AI Risk Scanner
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Upload a PDF or TXT contract. Our machine learning model will instantly extract the text and flag dangerous clauses or missing protections.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">New Analysis</h3>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
              <span className="text-sm font-medium text-slate-700">
                {file ? file.name : "Click to select document"}
              </span>
              <span className="text-xs text-slate-400 mt-1">PDF or TXT up to 10MB</span>
            </label>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            {isUploading ? "AI is Reading..." : "Scan Document"}
          </button>
        </div>

        {/* History List */}
        <div className="p-4 flex-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 px-2">Recently Scanned</h3>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400 px-2 italic">No contracts scanned yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((report) => (
                <li key={report._id}>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group ${
                      selectedReport?._id === report._id
                        ? "bg-indigo-50 border-indigo-200 shadow-sm"
                        : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="truncate pr-2 flex-1">
                      <p className={`text-sm font-semibold truncate ${selectedReport?._id === report._id ? "text-indigo-900" : "text-slate-700"}`}>
                        {report.fileName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${selectedReport?._id === report._id ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-500"}`} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* ---------------- RIGHT CONTENT: SPLIT VIEW ---------------- */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col bg-slate-100">
        {!selectedReport ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <ShieldAlert className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">No Document Selected</h2>
            <p className="text-slate-500 mt-2 max-w-md">
              Upload a new contract from the sidebar or select a previously scanned document to view its AI risk profile.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* PANE 1: EXTRACTED TEXT */}
            <div className="flex-1 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold text-slate-700">Extracted Document Text</h3>
              </div>
              <div className="flex-1 p-6 overflow-y-auto font-serif text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {selectedReport.extractedText}
              </div>
            </div>

            {/* PANE 2: AI RISK REPORT */}
            <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden lg:max-w-xl xl:max-w-2xl">
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Risk Analysis Report</h3>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Risk Score:</span>
                  <span className={`font-black ${getScoreColor(selectedReport.riskScore)}`}>
                    {selectedReport.riskScore}/100
                  </span>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {selectedReport.risks.length === 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-green-800">Looks Solid!</h4>
                    <p className="text-green-600 text-sm mt-1">Our AI did not detect any high-risk clauses in this document.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <Info className="w-5 h-5 text-blue-500 shrink-0" />
                      <p>The ML model flagged <strong>{selectedReport.risks.length}</strong> potential issues requiring your attention.</p>
                    </div>

                    {selectedReport.risks.map((risk, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className={`px-4 py-2 border-b flex items-center justify-between ${getSeverityColor(risk.severity).replace('text-', 'bg-').replace('100', '50')}`}>
                          <span className={`text-xs font-black uppercase tracking-wider ${getSeverityColor(risk.severity).split(' ')[1]}`}>
                            {risk.severity} Risk
                          </span>
                          <AlertTriangle className={`w-4 h-4 ${getSeverityColor(risk.severity).split(' ')[1]}`} />
                        </div>
                        <div className="p-5 space-y-4">
                          <div>
                            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Flagged Clause</h4>
                            <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">{risk.clause}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Identified Issue</h4>
                            <p className="text-sm text-slate-600">{risk.issue}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">AI Suggestion</h4>
                            <p className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100">{risk.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}