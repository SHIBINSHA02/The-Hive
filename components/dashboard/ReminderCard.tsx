// components/dashboard/ReminderCard.tsx
"use client";

import React, { useState } from "react";
import * as Lucide from "lucide-react";

export const ReminderCard = ({ contract, onAction }) => {
  const [isDrafting, setIsDrafting] = useState(false);
  const [showAiDraft, setShowAiDraft] = useState(false);
  const [aiDraft, setAiDraft] = useState("");

  const statusColors = {
    urgent: "bg-rose-100 text-rose-700 border-rose-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    overdue: "bg-red-100 text-red-700 border-red-200",
    normal: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const handleAiDraft = async () => {
    setIsDrafting(true);

    const draft = `
Dear ${contract?.clientName || "Client"},

This is a reminder regarding your contract:
"${contract?.contractTitle || "Contract"}".

Deadline: ${contract?.deadline || "N/A"}
Amount: ${contract?.amount || "N/A"}

Please take the necessary action.

Best regards,
Contract Lifecycle Team
`;

    setAiDraft(draft);
    setIsDrafting(false);
    setShowAiDraft(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-indigo-300 hover:shadow-lg group">

      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            statusColors[contract?.status] || statusColors.normal
          }`}>
            {contract?.status || "normal"}
          </div>

          <span className="text-lg font-bold text-slate-900">
            {contract?.amount || "$0"}
          </span>
        </div>

        <h4 className="text-slate-900 font-semibold text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {contract?.contractTitle || "Untitled Contract"}
        </h4>

        <p className="text-slate-500 text-sm mt-1">
          {contract?.clientName || "Unknown Client"}
        </p>

        <div className="mt-4 flex items-center text-slate-500 text-sm space-x-4">
          <div className="flex items-center">
            <Lucide.Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
            {contract?.deadline || "N/A"}
          </div>

          {contract?.email && (
            <div className="flex items-center">
              <Lucide.Mail className="w-4 h-4 mr-1.5 text-slate-400" />
              {contract.email.split("@")[0]}...
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col space-y-2">
          <button
            onClick={() => onAction && onAction(contract)}
            className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Lucide.Send className="w-4 h-4 mr-2" />
            Send Manual Reminder
          </button>

          <button
            onClick={handleAiDraft}
            disabled={isDrafting}
            className="w-full bg-indigo-50 text-indigo-700 py-2.5 rounded-xl font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isDrafting
              ? <Lucide.Loader2 className="w-4 h-4 mr-2 animate-spin" />
              : <Lucide.Sparkles className="w-4 h-4 mr-2" />
            }
            {isDrafting ? "Drafting..." : "Draft (Temporary)"}
          </button>
        </div>
      </div>

      {showAiDraft && (
        <div className="bg-indigo-50 p-4 border-t border-indigo-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-indigo-600 flex items-center">
              <Lucide.Sparkles className="w-3 h-3 mr-1" />
              TEMP DRAFT
            </span>

            <button
              onClick={() => setShowAiDraft(false)}
              className="text-indigo-400 hover:text-indigo-600"
            >
              <Lucide.X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-slate-700 italic leading-relaxed whitespace-pre-wrap">
            {aiDraft}
          </p>

          <button
            onClick={() => {
              navigator.clipboard.writeText(aiDraft);
              alert(`Draft copied`);
              setShowAiDraft(false);
            }}
            className="mt-3 text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700"
          >
            Copy & Use
          </button>
        </div>
      )}
    </div>
  );
};
