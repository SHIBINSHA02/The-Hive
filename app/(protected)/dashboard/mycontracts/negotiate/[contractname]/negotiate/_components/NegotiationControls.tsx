"use client";

import { Check, Send, X, AlertCircle, Loader2 } from "lucide-react";
import { Contract } from "@/types/contract";

interface NegotiationControlsProps {
  contract: Contract;
  isDirty: boolean;
  onPropose: () => void;
  onAgree: () => void;
  onCancel: () => void;
  onReject: () => void;
  onTerminate: () => void;
  isSubmitting: boolean;
  isAgreeing: boolean;
  isRejecting: boolean;
  isTerminating: boolean;
}

export default function NegotiationControls({
  contract,
  isDirty,
  onPropose,
  onAgree,
  onCancel,
  onReject,
  onTerminate,
  isSubmitting,
  isAgreeing,
  isRejecting,
  isTerminating
}: NegotiationControlsProps) {
  const isOwner = contract.viewerRole === "owner";
  const isMyTurn = contract.currentTurn === (isOwner ? "owner" : "partyB");
  const hasAgreed = isOwner ? contract.ownerAgreed : contract.partyBAgreed;
  const counterpartyAgreed = isOwner ? contract.partyBAgreed : contract.ownerAgreed;

  // Check if there is a legit change request from the other side
  const hasHistoryFromOthers = contract.versionHistory?.some(v => v.updatedBy !== (isOwner ? contract.ownerId : contract.partyB_ClerkId));
  const hasCounterpartyProposal = hasHistoryFromOthers || (contract.contractStatus === "sent_for_review" && !isOwner);

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
              className={`flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all ${!isDirty ? "opacity-40" : "opacity-100"}`}
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

        {isMyTurn && !hasAgreed && !isDirty && hasCounterpartyProposal && (
          <div className="flex items-center gap-3">
            <button
              onClick={onAgree}
              disabled={isAgreeing || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg text-sm font-bold hover:bg-green-50 transition-all disabled:opacity-50 shadow-sm"
            >
              {isAgreeing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Approve Changes
            </button>

            <button
                onClick={onReject}
                disabled={isRejecting || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-all disabled:opacity-50 shadow-sm"
            >
                {isRejecting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                Reject Changes
            </button>
          </div>
        )}

        {isMyTurn && !hasAgreed && !isDirty && !hasCounterpartyProposal && (
           <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 italic">
               Waiting for initial proposal or edits.
           </div>
        )}

        {!isMyTurn && !isDirty && !hasAgreed && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 italic">
                <AlertCircle size={14} />
                Editing is disabled while it's the other party's turn.
            </div>
        )}

        {hasAgreed && !isMyTurn && (
           <button
                onClick={onReject}
                disabled={isRejecting || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
            >
                {isRejecting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                Withdraw Agreement
            </button>
        )}

        <button
          onClick={onTerminate}
          disabled={isTerminating}
          className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-all ml-auto"
        >
          {isTerminating ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
          Terminate Negotiation
        </button>
      </div>
    </div>
  );
}
