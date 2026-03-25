"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ContractDetailsView from "@/components/contract/ContractDetailsView";
import { Contract, Financial } from "@/types/contract";

export default function NegotiateContractPage() {
  const { contractname } = useParams();
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

  return (
    <ContractDetailsView 
      contractId={contractId}
      data={data}
      finance={finance}
      loading={loading}
      error={error}
    />
  );
}
