"use client";

/**
 * FormField.tsx
 * -------------
 * The "Smart" input component.
 * It handles the rendering of labels, required markers, and the AI Refine button.
 */

import { useState } from "react";
import { useContract } from "@/app/(protected)/dashboard/mycontracts/create-contract/_context/ContractContext";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

type FormFieldProps = {
  fieldKey: string;
};

export function FormField({ fieldKey }: FormFieldProps) {
  const { template, formData, updateField, contractType, userProfile, creatorRole } = useContract();
  
  // 1. Get configuration from the dynamic template registry
  const config = template.contractPlaceholders[fieldKey];
  const aiPermission = template.placeholderAIPermissions[fieldKey];
  const value = formData[fieldKey] ?? "";

  // 2. States for AI interaction
  const [isRefining, setIsRefining] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 3. Determine if this field should be read-only (Auto-assigned)
  const isPartyAField = ["PARTY_A_NAME", "PARTY_A_EMAIL", "PARTY_A_SIGNATORY_NAME"].includes(fieldKey);
  const isPartyBField = ["PARTY_B_NAME", "PARTY_B_EMAIL", "PARTY_B_SIGNATORY_NAME"].includes(fieldKey);
  
  // Refined Lock Logic: Only lock the party that was auto-filled based on selected creatorRole
  let isLocked = false;
  if (creatorRole === 'contractor' && userProfile?.contractorProfile) {
    isLocked = isPartyBField;
  } else if (creatorRole === 'client' && userProfile?.clientProfile) {
    isLocked = isPartyAField;
  }

  const isDisabled = isRefining || isLocked;

  /**
   * AI REFINEMENT HANDLER
   * Sends the current text to the backend to be polished into legal language.
   */
  const handleRefine = async () => {
    if (!value.trim()) return;
    
    setIsRefining(true);
    setShowSuccess(false);

    try {
      const response = await fetch("/api/contract/refine-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractType, // CRITICAL: Tell API which template logic to use
          fieldKey,
          fieldValue: value,
        }),
      });

      const data = await response.json();
      
      if (data.refinedValue) {
        updateField(fieldKey, data.refinedValue);
        // Show success checkmark briefly
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error("AI Refinement failed:", error);
    } finally {
      setIsRefining(false);
    }
  };

  const inputBaseStyle = "w-full rounded-md border border-gray-300 shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-gray-50 disabled:text-gray-500";
  
  return (
    <div className="space-y-1.5 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-700">
          {config.label}
          {config.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* AI BUTTON LOGIC */}
        {aiPermission?.allowAI && value.trim().length > 5 && (
          <button
            onClick={handleRefine}
            disabled={isRefining}
            className={`text-xs flex items-center gap-1.5 font-bold transition-all ${
              showSuccess ? "text-green-600" : "text-purple-600 hover:text-purple-800"
            }`}
            type="button"
          >
            {isRefining ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Refining...
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Refined!
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Refine with AI
              </>
            )}
          </button>
        )}
        
        {isLocked && (
          <span className="text-[10px] items-center px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100 uppercase tracking-tight">
            Auto-assigned
          </span>
        )}
      </div>

      <div className="relative group">
        {config.type === "text" ? (
          <textarea
            value={value}
            onChange={(e) => updateField(fieldKey, e.target.value)}
            onFocus={() => window.dispatchEvent(new CustomEvent("field-focus", { detail: fieldKey }))}
            rows={4}
            className={inputBaseStyle}
            placeholder={config.placeholder}
            disabled={isDisabled}
          />
        ) : config.type === "image" ? (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onFocus={() => window.dispatchEvent(new CustomEvent("field-focus", { detail: fieldKey }))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isDisabled}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    updateField(fieldKey, reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {value && (
              <div className="mt-2 text-xs text-green-600 font-medium">Image uploaded successfully</div>
            )}
          </div>
        ) : fieldKey === "PAYMENT_CURRENCY" ? (
          <select
            value={value}
            onChange={(e) => updateField(fieldKey, e.target.value)}
            className={inputBaseStyle + " appearance-none bg-white"}
            disabled={isDisabled}
          >
            <option value="" disabled>Select Currency</option>
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={config.type === "date" ? "date" : "text"}
            value={value}
            onChange={(e) => updateField(fieldKey, e.target.value)}
            onFocus={() => window.dispatchEvent(new CustomEvent("field-focus", { detail: fieldKey }))}
            className={inputBaseStyle}
            placeholder={config.placeholder}
            disabled={isDisabled}
          />
        )}
        {isLocked && (
           <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
             <CheckCircle2 className="h-4 w-4 text-blue-500" />
           </div>
        )}
        
        {/* Subtle loading overlay for the input itself */}
        {isRefining && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-md cursor-wait" />
        )}
      </div>
    </div>
  );
}