"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useContract } from "../_context/ContractContext";
import { FormField } from "@/components/contract/FormField";

export default function StepTwoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  // ADDED: isInitialized to ensure we don't check before localStorage loads
  const { template, formData, isInitialized } = useContract();

  // --- URL GUARD LOGIC ---
  useEffect(() => {
    if (!isInitialized || !template) return;

    // Check if STEP 1 (index 0) is complete
    const prevStepConfig = template.templateConfig.steps[0];
    const prevMissing = prevStepConfig.fields.filter((key: string) => {
      const isRequired = template.contractPlaceholders[key].required;
      const value = formData[key];
      return isRequired && (!value || value.trim() === "");
    });

    // If Step 1 is missing required fields, bounce them back to Step 1
    if (prevMissing.length > 0) {
      router.replace(`./step-1?type=${type}`);
    }
  }, [isInitialized, formData, template, router, type]);
  // -----------------------

  if (!type || !template) return null;

  // Configuration for Step 2 (Index 1)
  const stepConfig = template.templateConfig.steps[1];

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
        <button
          onClick={() => router.push(`./step-1?type=${type}`)}
          className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>

        <div className="flex flex-col items-end">
          <button
            onClick={() => router.push(`./step-3?type=${type}`)}
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