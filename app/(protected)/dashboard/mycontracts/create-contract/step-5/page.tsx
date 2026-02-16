"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useContract } from "../_context/ContractContext";
import { FormField } from "@/components/contract/FormField";

export default function StepFivePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  const { template, formData, selectedClauses, toggleClause } = useContract();
  
  if (!type || !template) return null;

  // Access the step configuration directly using index 4
  const stepConfig = template.templateConfig.steps[4];
  const optionalClauseIds = Object.keys(template.optionalClauses);

  /**
   * GATE LOGIC:
   * Checks if all 'required' fields for THIS step have a value in context.
   */
  const isStepComplete = stepConfig.fields.every((key) => {
    const isRequired = template.contractPlaceholders[key].required;
    const value = formData[key];
    return !isRequired || (value && value.trim() !== "");
  });

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Step 5: {stepConfig.title}
        </h1>
        <p className="text-gray-600 mt-1 text-sm">{stepConfig.description}</p>
      </div>

      {/* 1. Signatory & Notice Details */}
      <div className="space-y-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-blue-600">
          Final Signatory Details
        </h2>
        <div className="grid grid-cols-1 gap-5">
          {stepConfig.fields.map((key) => (
            <FormField key={key} fieldKey={key} />
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 2. Optional Legal Clauses */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-blue-600">
          Optional Protections
        </h2>
        
        <div className="grid grid-cols-1 gap-3">
          {optionalClauseIds.map((clauseId) => {
            const isSelected = selectedClauses.includes(clauseId);
            return (
              <label 
                key={clauseId}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={isSelected}
                  onChange={() => toggleClause(clauseId)}
                />
                <div>
                  <span className="block text-sm font-semibold text-gray-900 capitalize">
                    {clauseId.replace(/_/g, " ")}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Include specific {clauseId.replace(/_/g, " ")} terms in the final document.
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
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
            className={`px-8 py-2 rounded-md shadow-sm font-semibold transition-all ${
              isStepComplete
                ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Review & Generate →
          </button>
          
          {!isStepComplete && (
            <p className="text-[10px] text-red-500 mt-1 font-medium">
              Missing required signatory info
            </p>
          )}
        </div>
      </div>
    </div>
  );
}