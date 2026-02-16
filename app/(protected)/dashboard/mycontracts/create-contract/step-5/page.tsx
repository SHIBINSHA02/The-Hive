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

  // Access Step 5 configuration (Index 4)
  const stepConfig = template.templateConfig.steps[4];
  const optionalClauseIds = Object.keys(template.optionalClauses);

  /**
   * DYNAMIC FIELD DETECTOR
   * Scans legal text for placeholders in optional clauses.
   */
  const getFieldsForClause = (clauseId: string) => {
    const clauseText = template.optionalClauses[clauseId];
    const matches = Array.from(clauseText.matchAll(/\{\{([^}]+)\}\}/g));
    return matches.map(match => match[1]);
  };

  /**
   * GATE LOGIC
   * We only allow the user to proceed if required fields are filled.
   */
  const isStepComplete = stepConfig.fields.every((key) => {
    const isRequired = template.contractPlaceholders[key]?.required;
    const value = formData[key];
    return !isRequired || (value && value.trim() !== "");
  });

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 space-y-8 pb-10">
        {/* 1. Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Step 5: {stepConfig.title}
          </h1>
          <p className="text-gray-600 mt-1 text-sm">{stepConfig.description}</p>
        </div>

        {/* 2. Standard Signatory Fields */}
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

        {/* 3. Optional Clauses */}
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

                  {/* Dynamic Fields injected here */}
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

      {/* ======================================================
          THE NAVIGATION FOOTER (THE MISSING BUTTON)
          ====================================================== */}
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