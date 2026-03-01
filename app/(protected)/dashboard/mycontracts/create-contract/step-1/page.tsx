"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useContract } from "../_context/ContractContext";
import { FormField } from "@/components/contract/FormField";

export default function StepOnePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  const { template, formData } = useContract();
  
  if (!type || !template) return null;

  const stepConfig = template.templateConfig.steps[0];

  /**
   * SEQUENTIAL GATE LOGIC
   * 1. Get all fields for this step
   * 2. Filter only those marked 'required' in the template
   * 3. Check if any are empty in formData
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
          Step 1: {stepConfig.title}
        </h1>
        <p className="text-gray-600 mt-1 text-sm">{stepConfig.description}</p>
      </div>

      <div className="space-y-5">
        {stepConfig.fields.map((key) => (
          <FormField key={key} fieldKey={key} />
        ))}
      </div>

      <div className="flex flex-col items-end pt-6 border-t border-gray-100">
        <button
          onClick={() => router.push(`./step-2?type=${type}`)}
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
          <p className="text-xs text-red-500 mt-2">
            Please fill in all required fields to continue.
          </p>
        )}
      </div>
    </div>
  );
}