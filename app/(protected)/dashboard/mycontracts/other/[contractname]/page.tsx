"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ContractDetailsView from "@/components/contract/ContractDetailsView";
import { Contract, Financial } from "@/types/contract";

export default function OtherContractPage() {
  const { contractname } = useParams();
  const router = useRouter();
  const contractId = decodeURIComponent(contractname as string);

  const [data, setData] = useState<Contract | null>(null);
  const [finance, setFinance] = useState<Financial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this contract? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/contracts/${contractId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete contract");
      router.push("/dashboard/mycontracts");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <ContractDetailsView 
      contractId={contractId}
      data={data}
      finance={finance}
      loading={loading}
      error={error}
      headerActions={
        data?.contractStatus === "terminated" && data.viewerRole === "owner" && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-lg"
          >
            <Trash2 className="w-5 h-5" />
            Delete Contract
          </button>
        )
      }
    />
  );
}
