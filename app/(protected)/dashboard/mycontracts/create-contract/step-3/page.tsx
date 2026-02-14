// app/(protected)/dashboard/mycontracts/create-contract/step-3/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useContract } from "../_context/ContractContext";

export default function StepThree() {
  const router = useRouter();
  const { data, updateData } = useContract();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Step 3: Agreement Introduction</h1>

      <textarea
        value={data.introduction ?? ""}
        onChange={(e) =>
          updateData({ introduction: e.target.value })
        }
        rows={6}
        placeholder="Describe the purpose and scope of the agreement..."
        className="w-full rounded-md border border-gray-300 shadow-sm p-3"
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
            router.push("/dashboard/mycontracts/create-contract/preview")
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-sm"
        >
          Preview
        </button>
      </div>
    </div>
  );
}
