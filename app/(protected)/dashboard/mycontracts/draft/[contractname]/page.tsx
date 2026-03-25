"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Contract, Financial } from "@/types/contract";
import { Loader2, Camera, Edit3, Mail, Trash2 } from "lucide-react";
import ContractDetailsView from "@/components/contract/ContractDetailsView";

interface ContractDetailsResponse {
  contract: Contract;
  versionHistory?: { contentSnapshot: string; updatedAt: Date }[];
  finance: Financial | null;
  role: "client" | "contractor" | "owner" | "partyB";
}

export default function DraftContractDetailsPage() {
  const { contractname } = useParams();
  const contractId = decodeURIComponent(contractname as string);
  const router = useRouter();

  const [data, setData] = useState<Contract | null>(null);
  const [finance, setFinance] = useState<Financial | null>(null);
  const [viewerRole, setViewerRole] = useState<"client" | "contractor" | "owner" | "partyB" | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAgreeing, setIsAgreeing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    if (!contractId) return;

    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/contracts/${contractId}`, {
          method: "GET",
          cache: "no-store"
        });

        if (!res.ok) throw new Error("Failed to fetch contract");

        const json: ContractDetailsResponse = await res.json();
        setData(json.contract);
        setFinance(json.finance ?? null);
        setViewerRole(json.role);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);




  const handleSendInvite = async () => {
    if (!data?.partyB_Email || !data.partyB_Email.includes("@")) {
      alert("Please set a valid counterparty email in the 'Edit Draft' page first.");
      return;
    }

    if (!window.confirm(`Are you sure you want to send this contract to ${data.partyB_Email} for review?`)) {
      return;
    }

    setIsSendingInvite(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.partyB_Email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send invite");
      }

      router.push(`/dashboard/requests/${contractId}`);
    } catch (err: any) {
      alert(err.message || "Something went wrong sending the invite.");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this draft? This action cannot be undone.")) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/contracts/${contractId}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete draft");
      }
      router.push("/dashboard/mycontracts");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  );
  if (error) return <div className="p-6 text-red-600 font-semibold">Error: {error}</div>;
  if (!data) return <div className="p-6">No contract found</div>;

  return (
    <ContractDetailsView
      contractId={contractId}
      data={data}
      finance={finance}
      loading={loading}
      error={error}
      showDiff={showDiff}
      setShowDiff={setShowDiff}
      bannerOverlay={viewerRole === "owner" && (
        <label className="absolute top-4 right-4 z-50 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 text-sm font-bold shadow-2xl border border-white/20">
          <Camera className="w-5 h-5 text-blue-400" />
          <span>Change Background</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                  const base64 = reader.result as string;
                  setData(prev => prev ? { ...prev, bgImageUrl: base64 } as Contract : null);
                  try {
                    await fetch(`/api/contracts/${contractId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ bgImageUrl: base64 })
                    });
                  } catch (err) {
                    console.error("Failed to update background", err);
                  }
                };
                reader.readAsDataURL(file);
              }
            }} 
          />
        </label>
      )}
      logoOverlay={viewerRole === "owner" && (
        <label className="absolute -top-3 -left-3 z-50 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full cursor-pointer transition-all shadow-xl border-2 border-white">
          <Camera className="w-4 h-4" />
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                  const base64 = reader.result as string;
                  setData(prev => prev ? { ...prev, companyLogoUrl: base64 } as Contract : null);
                  try {
                    await fetch(`/api/contracts/${contractId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ companyLogoUrl: base64 })
                    });
                  } catch (err) {
                    console.error("Failed to update logo", err);
                  }
                };
                reader.readAsDataURL(file);
              }
            }} 
          />
        </label>
      )}
      headerActions={viewerRole === "owner" && (
        <>
          <Link
            href={`/dashboard/mycontracts/draft/${encodeURIComponent(contractId)}/edit`}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <Edit3 className="w-5 h-5" />
            Edit Draft
          </Link>

          <button
            onClick={handleSendInvite}
            disabled={isSendingInvite}
            className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
          >
            {isSendingInvite ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            Send for Review
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-white/10 hover:bg-red-600/20 text-white/70 hover:text-white px-4 py-2.5 rounded-lg font-semibold border border-white/20 hover:border-red-500 transition-all flex items-center gap-2"
          >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            Delete
          </button>
        </>
      )}
    />
  );
}
