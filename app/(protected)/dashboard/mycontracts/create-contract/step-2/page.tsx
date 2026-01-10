"use client";

import { useRouter } from "next/navigation";
import { useContract } from "../_context/ContractContext";

export default function StepTwo() {
  const router = useRouter();
  const { data, updateData } = useContract();

  const input =
    "mt-1 w-full rounded-md border border-gray-300 shadow-sm p-3";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Step 2: Company Info</h1>

      <input
        value={data.companyName ?? ""}
        onChange={(e) =>
          updateData({ companyName: e.target.value })
        }
        placeholder="Company name (optional)"
        className={input}
      />

      <input
        value={data.companyLogoUrl ?? ""}
        onChange={(e) =>
          updateData({ companyLogoUrl: e.target.value })
        }
        placeholder="Company logo URL (optional)"
        className={input}
      />

      <div className="flex justify-between">
        <button
          onClick={() => router.back()}
          className="border px-6 py-2 rounded-md"
        >
          Previous
        </button>

        <button
          onClick={() =>
            router.push("/dashboard/mycontracts/create-contract/step-3")
          }
          className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
