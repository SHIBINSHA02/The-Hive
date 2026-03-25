"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import ContractDetailsView from "@/components/contract/ContractDetailsView";
import { Contract, Financial } from "@/types/contract";
import { Loader2, Mail, Edit3, Sparkles, X, Camera, Save } from "lucide-react";

export default function RequestContractDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const contractId = decodeURIComponent(id as string);

  const [data, setData] = useState<Contract | null>(null);
  const [finance, setFinance] = useState<Financial | null>(null);
  const [viewerRole, setViewerRole] = useState<"client" | "contractor" | "owner" | "partyB" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAgreeing, setIsAgreeing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const [isPaying, setIsPaying] = useState<number | null>(null);

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
      setViewerRole(json.role);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePayMilestone = async (milestoneIndex: number) => {
    setIsPaying(milestoneIndex);
    try {
      const res = await fetch(`/api/contracts/${contractId}/finance/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneIndex })
      });
      
      if (!res.ok) throw new Error("Payment update failed");
      
      const updated = await res.json();
      setFinance(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPaying(null);
    }
  };

  const handleEditToggle = () => {
    setEditContent(data?.contractContent || "");
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/contracts/${contractId}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractContent: editContent })
      });
      
      if (!res.ok) throw new Error("Failed to save changes");
      
      const updated = await res.json();
      setData(updated as Contract);
      setIsEditing(false); 
      setIsAgreeing(false); 
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSendInvite = async () => {
    const emailToUse = data?.partyB_Email || inviteEmail;

    if (!emailToUse || !emailToUse.includes("@")) {
      const fallbackEmail = window.prompt("Please enter the counterparty's email:");
      if (!fallbackEmail || !fallbackEmail.includes("@")) {
        alert("Valid email is required.");
        return;
      }
      setInviteEmail(fallbackEmail);
      return; 
    }

    setIsSendingInvite(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });

      if (!res.ok) throw new Error("Failed to send invite");

      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleAgree = async () => {
    try {
      setIsAgreeing(true);
      const res = await fetch(`/api/contracts/${contractId}/agree`, { method: "POST" });
      const result = await res.json();
      if (result.status === "active") {
        alert("Both parties have agreed! The contract is now In Progress.");
        router.push(`/dashboard/mycontracts/onprogress/${encodeURIComponent(contractId)}`);
      } else {
        await fetchData();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAgreeing(false);
    }
  };

  const handleSign = async () => {
    try {
      setIsSigning(true);
      const res = await fetch(`/api/contracts/${contractId}/sign`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to sign contract");
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSigning(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      const res = await fetch(`/api/contracts/${contractId}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel request");
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const headerActions = data && (
    <div className="flex flex-wrap items-center gap-3">
      {data.contractStatus === "draft" && viewerRole === "owner" && (
        <button
          onClick={handleSendInvite}
          disabled={isSendingInvite}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
        >
          {isSendingInvite ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
          Send for Review
        </button>
      )}

      {(data.contractStatus === "in_negotiation" || data.contractStatus === "sent_for_review") && !isEditing && (
        <div className="flex items-center gap-3">
          {((viewerRole === "owner" && !data.ownerAgreed) || (viewerRole !== "owner" && !data.partyBAgreed)) ? (
            <>
              {((viewerRole === "owner" && data.currentTurn === "owner") || (viewerRole !== "owner" && data.currentTurn === "partyB")) ? (
                <button
                  onClick={handleEditToggle}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2.5 rounded-lg font-semibold border border-white/50 flex items-center gap-2 transition-all shadow-lg"
                >
                  <Edit3 className="w-4 h-4" />
                  Suggest Edits
                </button>
              ) : (
                <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2.5 rounded-lg font-semibold border border-white/50 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {viewerRole === "owner" ? "Counterparty is Reviewing..." : "Owner is Editing..."}
                </div>
              )}

              <button
                  onClick={handleAgree}
                  disabled={isAgreeing || isEditing}
                  className={`px-5 py-2.5 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 ${
                    isEditing ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-500 text-white"
                  }`}
              >
                  {isAgreeing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Agree to Content
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Waiting for Counterparty to Agree...
              </div>
              <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="bg-red-600/20 hover:bg-red-600/40 backdrop-blur-md text-white px-5 py-2.5 rounded-lg font-semibold border border-red-500/50 flex items-center gap-2 transition-all"
              >
                  {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                  Rescind Agreement
              </button>
            </div>
          )}
          
          {viewerRole === "owner" && (
              <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="bg-red-600/20 hover:bg-red-600/40 backdrop-blur-md text-white px-5 py-2.5 rounded-lg font-semibold border border-red-500/50 flex items-center gap-2 transition-all"
              >
                  {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                  Cancel Request
              </button>
          )}
        </div>
      )}

      {data.contractStatus === "locked" && (
        <>
          {((viewerRole === "owner" && !data.ownerSigned) || (viewerRole !== "owner" && !data.partyBSigned)) ? (
            <div className="flex items-center gap-3">
              <button
                  onClick={handleSign}
                  disabled={isSigning}
                  className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
              >
                  {isSigning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Sign Contract
              </button>
              {viewerRole === "owner" && (
                  <button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="bg-red-600/20 hover:bg-red-600/40 backdrop-blur-md text-white px-5 py-2.5 rounded-lg font-semibold border border-red-500/50 flex items-center gap-2 transition-all"
                  >
                      {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                      Unlock & Negotiate
                  </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <div className="bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Awaiting Counterparty Signature...
              </div>
            </div>
          )}
        </>
      )}

      {isEditing && (
          <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
              <button 
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-sm font-semibold text-white/70 hover:bg-white/10 rounded-md transition-colors"
              >
                  Cancel
              </button>
              <button 
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || editContent === data.contractContent}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-blue-400"
              >
                  {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Proposed Changes
              </button>
          </div>
      )}
    </div>
  );

  const logoOverlay = viewerRole === "owner" && (
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
  );

  const bannerOverlay = viewerRole === "owner" && (
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
  );

  return (
    <ContractDetailsView 
      contractId={contractId}
      data={data}
      finance={finance}
      loading={loading}
      error={error}
      headerActions={headerActions}
      logoOverlay={logoOverlay}
      bannerOverlay={bannerOverlay}
      isEditing={isEditing}
      editContent={editContent}
      setEditContent={setEditContent}
      showDiff={showDiff}
      setShowDiff={setShowDiff}
      onPayMilestone={handlePayMilestone}
      isPaying={isPaying}
    />
  );
}