"use client";

/**
 * create-contract/page.tsx
 * ------------------------
 * Contract type selection page.
 *
 * Shows available templates from registry and routes user to step-1.
 */

import { useRouter } from "next/navigation";
import { getAllTemplateConfigs } from "@/lib/contract-templates/registry";

export default function CreateContractPage() {
  const router = useRouter();

  const templates = getAllTemplateConfigs();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900">
          Select Contract Type
        </h1>
        <p className="text-gray-600 mt-2">
          Choose a contract template to begin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {templates.map((template) => (
            <button
              key={template.contractType}
              onClick={() =>
                router.push(
                  `/dashboard/mycontracts/create-contract/step-1?type=${template.contractType}`
                )
              }
              className="text-left bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {template.name}
              </h2>

              <p className="text-gray-600 mt-2">{template.description}</p>

              <p className="text-sm text-blue-600 mt-4 font-medium">
                Start →
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
