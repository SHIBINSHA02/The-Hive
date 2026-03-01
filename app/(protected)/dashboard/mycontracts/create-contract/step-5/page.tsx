"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useContract } from "../_context/ContractContext";
import { FormField } from "@/components/contract/FormField";

export default function StepFivePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  // ADDED: isInitialized for the Guard
  const { template, formData, selectedClauses, toggleClause, isInitialized } = useContract();

  // --- URL GUARD LOGIC ---
  useEffect(() => {
    if (!isInitialized || !template) return;

    // Check if STEP 4 (index 3) is complete
    const prevStepConfig = template.templateConfig.steps[3];
    const prevMissing = prevStepConfig.fields.filter((key: string) => {
      const isRequired = template.contractPlaceholders[key].required;
      const value = formData[key];
      return isRequired && (!value || value.trim() === "");
    });

    // If Step 4 is missing required fields, bounce them back to Step 4
    if (prevMissing.length > 0) {
      router.replace(`./step-4?type=${type}`);
    }
  }, [isInitialized, formData, template, router, type]);
  // -----------------------
  
  if (!type || !template) return null;

  const stepConfig = template.templateConfig.steps[4];
  const optionalClauseIds = Object.keys(template.optionalClauses);

  const getFieldsForClause = (clauseId: string) => {
    const clauseText = template.optionalClauses[clauseId];
    const matches = Array.from(clauseText.matchAll(/\{\{([^}]+)\}\}/g));
    return matches.map(match => match[1]);
  };

  const isStepComplete = stepConfig.fields.every((key) => {
    const isRequired = template.contractPlaceholders[key]?.required;
    const value = formData[key];
    return !isRequired || (value && value.trim() !== "");
  });

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 space-y-8 pb-10">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Step 5: {stepConfig.title}
          </h1>
          <p className="text-gray-600 mt-1 text-sm">{stepConfig.description}</p>
        </div>

        <div className="space-y-5">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Signatory Details
          </h2>
          <div className="grid grid-cols-1 gap-5">
            {stepConfig.fields.map((key) => (
              <FormField key={key} fieldKey={key} />
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-blue-600">
            Optional Clauses
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {optionalClauseIds.map((clauseId) => {
              const isSelected = selectedClauses.includes(clauseId);
              const extraFields = getFieldsForClause(clauseId);

              return (
                <div key={clauseId} className="space-y-3">
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  }`}>
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={isSelected}
                      onChange={() => toggleClause(clauseId)}
                    />
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {clauseId.replace(/_/g, " ")}
                    </span>
                  </label>

                  {isSelected && extraFields.length > 0 && (
                    <div className="ml-8 p-4 border-l-2 border-blue-200 bg-gray-50 space-y-4">
                      {extraFields.map(fieldKey => (
                        <FormField key={fieldKey} fieldKey={fieldKey} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-auto">
        <button
          onClick={() => router.push(`./step-4?type=${type}`)}
          className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>

        <div className="flex flex-col items-end">
          <button
            onClick={() => router.push(`./preview?type=${type}`)}
            disabled={!isStepComplete}
            className={`px-8 py-3 rounded-lg shadow-lg font-bold transition-all ${
              isStepComplete
                ? "bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-0.5"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Review & Generate →
          </button>
          
          {!isStepComplete && (
            <p className="text-[10px] text-red-500 mt-2 font-medium">
              Fill required fields to preview draft
            </p>
          )}
        </div>
      </div>
    </div>
  );
}