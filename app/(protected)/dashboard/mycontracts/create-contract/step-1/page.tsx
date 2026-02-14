"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useContract } from "../_context/ContractContext";

export default function StepOne() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { data, updateData } = useContract();

  const contractorName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  // ✅ FIX: update ONLY if value changed
  useEffect(() => {
    if (
      isLoaded &&
      contractorName &&
      data.contractorName !== contractorName
    ) {
      updateData({ contractorName });
    }
  }, [isLoaded, contractorName, data.contractorName, updateData]);

  const input =
    "mt-1 w-full rounded-md border border-gray-300 shadow-sm p-3";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Step 1: Basic Details</h1>

      <input
        value={contractorName}
        disabled
        className={`${input} bg-gray-100`}
      />

      <textarea
        value={data.contractorAddress}
        onChange={(e) =>
          updateData({ contractorAddress: e.target.value })
        }
        placeholder="Contractor address"
        rows={3}
        className={input}
      />

      <input
        value={data.clientName}
        onChange={(e) =>
          updateData({ clientName: e.target.value })
        }
        placeholder="Client full name"
        className={input}
      />

      <textarea
        value={data.clientAddress}
        onChange={(e) =>
          updateData({ clientAddress: e.target.value })
        }
        placeholder="Client address"
        rows={3}
        className={input}
      />

      <button
        onClick={() =>
          router.push("/dashboard/mycontracts/create-contract/step-2")
        }
        className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm"
      >
        Next
      </button>
    </div>
  );
}
