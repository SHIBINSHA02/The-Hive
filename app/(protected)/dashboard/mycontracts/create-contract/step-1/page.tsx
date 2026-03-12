"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useContract } from "../_context/ContractContext";
import { FormField } from "@/components/contract/FormField";

export default function StepOnePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  const { template, formData, creatorRole, setCreatorRole, userProfile } = useContract();
  
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

      {/* Role Selection */}
      <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Creating as</h3>
          <p className="text-xs text-blue-700">Select your role to auto-fill details.</p>
        </div>
        <div className="flex gap-2">
          {userProfile?.clientProfile && (
            <button
              onClick={() => setCreatorRole('client')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all border ${
                creatorRole === 'client'
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-blue-600 border-blue-200 hover:border-blue-400"
              }`}
            >
              Client (Party A)
            </button>
          )}
          {userProfile?.contractorProfile && (
            <button
              onClick={() => setCreatorRole('contractor')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all border ${
                creatorRole === 'contractor'
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-blue-600 border-blue-200 hover:border-blue-400"
              }`}
            >
              Contractor (Party B)
            </button>
          )}
        </div>
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