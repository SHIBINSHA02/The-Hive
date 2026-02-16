"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useContract } from "../_context/ContractContext";
import { FormField } from "@/components/contract/FormField";

export default function StepFourPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  const { template, formData } = useContract();
  
  if (!type || !template) return null;

  // 1. Get configuration for Step 2 (Index 1)
  const stepConfig = template.templateConfig.steps[3];

  /**
   * SEQUENTIAL GATE LOGIC
   * We only disable 'Next'. 'Previous' always remains active.
   */
  const missingRequiredFields = stepConfig.fields.filter((key) => {
    const isRequired = template.contractPlaceholders[key].required;
    const value = formData[key];
    return isRequired && (!value || value.trim() === "");
  });

  const isStepComplete = missingRequiredFields.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Step 2: {stepConfig.title}
        </h1>
        <p className="text-gray-600 mt-1 text-sm">{stepConfig.description}</p>
      </div>

      <div className="space-y-5">
        {stepConfig.fields.map((key) => (
          <FormField key={key} fieldKey={key} />
        ))}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        {/* PREVIOUS: Always enabled */}
        <button
          onClick={() => router.push(`./step-3?type=${type}`)}
          className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>

        {/* NEXT: Gated by logic */}
        <div className="flex flex-col items-end">
          <button
            onClick={() => router.push(`./step-5?type=${type}`)}
            disabled={!isStepComplete}
            className={`px-8 py-2 rounded-md shadow-sm font-medium transition-all ${
              isStepComplete
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>
          
          {!isStepComplete && (
            <p className="text-[10px] text-red-500 mt-1">
              Required fields missing
            </p>
          )}
        </div>
      </div>
    </div>
  );
}