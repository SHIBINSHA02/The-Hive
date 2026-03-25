"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ContractDetailsView from "@/components/contract/ContractDetailsView";
import NegotiationControls from "./_components/NegotiationControls";
import { Contract, Financial } from "@/types/contract";
import { Loader2, ArrowLeft, ShieldCheck, History } from "lucide-react";
import Link from "next/link";

export default function NegotiationPage() {
  const { contractname } = useParams();
  const router = useRouter();
  const contractId = decodeURIComponent(contractname as string);

  const [data, setData] = useState<Contract | null>(null);
  const [finance, setFinance] = useState<Financial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Negotiation Edit State
  const [editContent, setEditContent] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgreeing, setIsAgreeing] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "GET",
        cache: "no-store"
      });

      if (!res.ok) throw new Error("Failed to fetch contract");

      const json = await res.json();
      setData(json.contract);
      setFinance(json.finance ?? null);
      setEditContent(json.contract.contractContent || "");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePropose = async () => {
    if (!data) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractContent: editContent })
      });

      if (!res.ok) throw new Error("Failed to propose changes");

      // Reload data to reflect turn toggle and cleared agreement flags
      await fetchData();
      setShowDiff(false);
      alert("Changes proposed successfully! It is now the other party's turn.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgree = async () => {
    if (!data) return;
    try {
      setIsAgreeing(true);
      const res = await fetch(`/api/contracts/${contractId}/agree`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Failed to agree to contract");

      const result = await res.json();
      await fetchData();
      
      if (result.status === "locked") {
        alert("Both parties have agreed! The contract is now locked for signing.");
        router.push(`/dashboard/mycontracts/negotiate/${encodeURIComponent(contractId)}`);
      } else {
        alert("Your agreement has been recorded. Waiting for the other party to agree.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAgreeing(false);
    }
  };

  const handleDiscard = () => {
    if (data) {
      setEditContent(data.contractContent || "");
      alert("Local changes discarded.");
    }
  };

  const handleTerminate = async () => {
    if (!data) return;
    if (!confirm("Are you sure you want to terminate this negotiation? This will revert the contract to a non-negotiable state for the other party.")) return;

    try {
      setIsTerminating(true);
      const res = await fetch(`/api/contracts/${contractId}/terminate`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Failed to terminate negotiation");

      alert("Negotiation terminated successfully.");
      router.push("/dashboard/mycontracts");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsTerminating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      <p className="text-gray-500 font-medium">Loading Negotiation Interface...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h2 className="text-lg font-bold">Error</h2>
        <p className="mt-1">{error}</p>
        <Link href={`/dashboard/mycontracts/negotiate/${encodeURIComponent(contractId)}`} className="inline-block mt-4 text-sm font-semibold underline">
          Go Back
        </Link>
      </div>
    </div>
  );

  if (!data) return <div className="p-12 text-center text-gray-500">Contract not found.</div>;

  const isOwner = data.viewerRole === "owner";
  const isMyTurn = data.currentTurn === (isOwner ? "owner" : "partyB");
  const isDirty = editContent !== data.contractContent;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
            <Link 
                href={`/dashboard/mycontracts/negotiate/${encodeURIComponent(contractId)}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    Negotiation: <span className="text-blue-600 font-extrabold">{data.contractTitle}</span>
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Refine clauses and reach mutual agreement.</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1.5 border border-blue-100">
                <ShieldCheck size={14} />
                Secure Channel
            </div>
            {data.versionHistory && data.versionHistory.length > 0 && (
                <div className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold flex items-center gap-1.5 border border-gray-200">
                    <History size={14} />
                    {data.versionHistory.length} Versions
                </div>
            )}
        </div>
      </div>

      <NegotiationControls 
        contract={data}
        isDirty={isDirty}
        onPropose={handlePropose}
        onAgree={handleAgree}
        onCancel={handleDiscard}
        onTerminate={handleTerminate}
        isSubmitting={isSubmitting}
        isAgreeing={isAgreeing}
        isTerminating={isTerminating}
      />

      <div className="grid grid-cols-1 gap-6">
        <ContractDetailsView 
            contractId={contractId}
            data={data}
            finance={finance}
            isEditing={isMyTurn}
            editContent={editContent}
            setEditContent={setEditContent}
            showDiff={showDiff}
            setShowDiff={setShowDiff}
        />
      </div>
    </div>
  );
}
