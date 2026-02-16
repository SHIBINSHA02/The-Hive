/**
 * ContractContext.tsx
 * -------------------
 * React Context for managing contract form data across all steps.
 * 
 * DYNAMIC DESIGN:
 * This context works with ANY contract type (service-agreement, nda, etc.)
 * It loads the correct template based on contractType prop.
 * 
 * Why Context?
 * - Share data across Step 1, Step 2, Step 3, etc. without prop drilling
 * - Persist data as user navigates between steps
 * - Single source of truth for form state
 * 
 * Usage:
 * <ContractProvider contractType="service-agreement">
 *   <YourSteps />
 * </ContractProvider>
 */

"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { 
  getContractTemplate, 
  type ContractType,
  type ContractTemplateModule
} from "@/lib/contract-templates/registry";

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Placeholder value map for form data.
 * 
 * Currently all values are strings because:
 * - Dates are stored as ISO strings (e.g., "2026-02-15")
 * - Numbers are stored as formatted strings (e.g., "$5,000")
 * - Text is naturally string
 * 
 * Future: If you add number/boolean types, expand to:
 * Record<string, string | number | boolean | null>
 */
type PlaceholderValueMap = Record<string, string>;

/**
 * Shape of the context value
 */
type ContractContextType = {
  // Contract type being created (e.g., "service-agreement", "nda")
  // Type-safe: only valid contract types from registry allowed
  contractType: ContractType;
  
  // The loaded template module (contains all functions and data)
  // This gives access to:
  // - template.contractPlaceholders
  // - template.templateConfig
  // - template.generateContract()
  // - template.validatePlaceholders()
  // - etc.
  template: ContractTemplateModule;
  
  // Form data: All placeholder values for this contract type
  // Partial because fields are filled gradually across steps
  formData: Partial<PlaceholderValueMap>;
  
  // Update a single field
  updateField: (key: string, value: string) => void;
  
  // Update multiple fields at once (useful for AI refinement)
  updateFields: (fields: Partial<PlaceholderValueMap>) => void;
  
  // Selected optional clauses
  // String array for maximum flexibility across different contract types
  // Each contract type has different clause IDs
  selectedClauses: string[];
  
  // Toggle an optional clause on/off
  toggleClause: (clauseId: string) => void;
  
  // Reset entire form (for starting over)
  resetForm: () => void;
};

// ============================================
// CONTEXT CREATION
// ============================================

const ContractContext = createContext<ContractContextType | null>(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

type ContractProviderProps = {
  children: ReactNode;
  
  // Required: Contract type from registry
  // Type-safe: TypeScript will error if invalid type passed
  contractType: ContractType;
};

export function ContractProvider({ 
  children, 
  contractType 
}: ContractProviderProps) {
  
  /**
   * Load the template module dynamically based on contractType
   * 
   * This uses the registry to get the correct template.
   * For "service-agreement" → loads service-agreement template
   * For "nda" → loads nda template
   * 
   * useMemo ensures we only load once (not on every render)
   * 
   * Benefits of this approach:
   * - Type-safe: contractType is ContractType, not any string
   * - Dynamic: Works with any contract type in registry
   * - Cached: Only loads once per contract type
   */
  const template = useMemo(() => {
    try {
      return getContractTemplate(contractType);
    } catch (error) {
      console.error(`Failed to load template: ${contractType}`, error);
      // Re-throw to prevent app from running with invalid state
      throw error;
    }
  }, [contractType]);
  
  // State: Form data (all placeholder values)
  const [formData, setFormData] = useState<Partial<PlaceholderValueMap>>({});
  
  // State: Selected optional clauses
  // Stores clause IDs like: ["confidentiality", "intellectual_property"]
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);

  /**
   * Update a single field value
   * 
   * This is the most common operation - user types in a field.
   * 
   * @param key - Placeholder key (e.g., "PARTY_A_NAME")
   * @param value - New value (always string from form inputs)
   * 
   * @example
   * updateField("PARTY_A_NAME", "Acme Corp");
   */
  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Update multiple fields at once
   * 
   * Useful for:
   * - AI refinement (update refined values in bulk)
   * - Auto-fill from user profile (Party A fields from Clerk)
   * - Bulk updates
   * 
   * @param fields - Object with multiple key-value pairs
   * 
   * @example
   * // Auto-fill Party A from Clerk user data:
   * updateFields({
   *   PARTY_A_NAME: `${user.firstName} ${user.lastName}`,
   *   PARTY_A_EMAIL: user.emailAddress
   * });
   * 
   * @example
   * // AI refinement result:
   * updateFields({
   *   SERVICE_DESCRIPTION: "Professional web development...",
   *   DELIVERABLES: "Fully responsive website with..."
   * });
   */
  const updateFields = (fields: Partial<PlaceholderValueMap>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  /**
   * Toggle an optional clause on/off
   * 
   * Used in Step 5 where user selects which optional clauses to include.
   * 
   * @param clauseId - Optional clause ID (e.g., "confidentiality")
   * 
   * @example
   * // User clicks "Confidentiality" checkbox:
   * toggleClause("confidentiality");
   * 
   * // First click: adds to array
   * // Second click: removes from array
   */
  const toggleClause = (clauseId: string) => {
    setSelectedClauses((prev) => {
      // If already selected, remove it
      if (prev.includes(clauseId)) {
        return prev.filter((id) => id !== clauseId);
      }
      // Otherwise, add it
      return [...prev, clauseId];
    });
  };

  /**
   * Reset form to empty state
   * 
   * Useful for:
   * - Starting a new contract from scratch
   * - Cancel/discard current draft
   * - Testing/development
   * 
   * Note: This doesn't change contractType - only clears data
   */
  const resetForm = () => {
    setFormData({});
    setSelectedClauses([]);
  };

  // Context value object
  const value: ContractContextType = {
    contractType,
    template, // ← Components can access all template functions and data
    formData,
    updateField,
    updateFields,
    selectedClauses,
    toggleClause,
    resetForm,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

// ============================================
// HOOK FOR CONSUMING CONTEXT
// ============================================

/**
 * Hook to access contract context
 * 
 * Must be used inside ContractProvider
 * 
 * @throws Error if used outside provider
 * 
 * @example
 * function Step1() {
 *   const { template, formData, updateField } = useContract();
 *   
 *   // Access template data:
 *   const placeholders = template.contractPlaceholders;
 *   const stepConfig = template.templateConfig.steps[0];
 *   
 *   // Render fields dynamically:
 *   return (
 *     <div>
 *       {stepConfig.fields.map(fieldKey => {
 *         const config = placeholders[fieldKey];
 *         return (
 *           <input
 *             key={fieldKey}
 *             value={formData[fieldKey] || ""}
 *             onChange={(e) => updateField(fieldKey, e.target.value)}
 *           />
 *         );
 *       })}
 *     </div>
 *   );
 * }
 */
export function useContract() {
  const context = useContext(ContractContext);
  
  if (!context) {
    throw new Error(
      "useContract must be used inside ContractProvider. " +
      "Wrap your component tree with <ContractProvider>."
    );
  }
  
  return context;
}

/**
 * Type exports for external use
 */
export type { ContractContextType, PlaceholderValueMap };