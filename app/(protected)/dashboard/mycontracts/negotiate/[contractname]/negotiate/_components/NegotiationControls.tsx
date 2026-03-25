"use client";

import { Check, Send, X, AlertCircle, Loader2 } from "lucide-react";
import { Contract } from "@/types/contract";

interface NegotiationControlsProps {
  contract: Contract;
  isDirty: boolean;
  onPropose: () => void;
  onAgree: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isAgreeing: boolean;
}

export default function NegotiationControls({
  contract,
  isDirty,
  onPropose,
  onAgree,
  onCancel,
  isSubmitting,
  isAgreeing
}: NegotiationControlsProps) {
  const isOwner = contract.viewerRole === "owner";
  const isMyTurn = contract.currentTurn === (isOwner ? "owner" : "partyB");
  const hasAgreed = isOwner ? contract.ownerAgreed : contract.partyBAgreed;
  const counterpartyAgreed = isOwner ? contract.partyBAgreed : contract.ownerAgreed;

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isMyTurn ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {isMyTurn ? "Your Turn to Edit" : `Waiting for ${contract.counterpartyName || "Counterparty"}`}
            </p>
            <p className="text-xs text-gray-500">
              {isMyTurn 
                ? "You hold the pen. Make changes and propose them to the other party." 
                : "The other party is currently reviewing or editing the contract."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            {hasAgreed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold ring-1 ring-green-200">
                    <Check size={14} /> You've Agreed
                </span>
            )}
            {counterpartyAgreed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold ring-1 ring-blue-200">
                    <Check size={14} /> {contract.counterpartyName} Agreed
                </span>
            )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
        {isMyTurn && (
          <>
            <button
              onClick={onPropose}
              disabled={!isDirty || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Propose Changes
            </button>
            
            {isDirty && (
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
              >
                <X size={16} />
                Discard Local Edits
              </button>
            )}
          </>
        )}

        {!hasAgreed && !isDirty && (
          <button
            onClick={onAgree}
            disabled={isAgreeing || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all disabled:opacity-50"
          >
            {isAgreeing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Agree to Current Version
          </button>
        )}

        {!isMyTurn && !isDirty && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 italic">
                <AlertCircle size={14} />
                Editing is disabled while it's the other party's turn.
            </div>
        )}
      </div>
    </div>
  );
}
