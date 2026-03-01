"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { 
  getContractTemplate, 
  type ContractType,
  type ContractTemplateModule
} from "@/lib/contract-templates/registry";

// ============================================
// TYPE DEFINITIONS
// ============================================

type PlaceholderValueMap = Record<string, string>;

type ContractContextType = {
  contractType: ContractType;
  template: ContractTemplateModule;
  formData: Partial<PlaceholderValueMap>;
  updateField: (key: string, value: string) => void;
  updateFields: (fields: Partial<PlaceholderValueMap>) => void;
  selectedClauses: string[];
  toggleClause: (clauseId: string) => void;
  resetForm: () => void;
  isInitialized: boolean; // Added to help UI know when data is restored
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
  contractType: ContractType;
};

export function ContractProvider({ 
  children, 
  contractType 
}: ContractProviderProps) {
  
  const template = useMemo(() => {
    try {
      return getContractTemplate(contractType);
    } catch (error) {
      console.error(`Failed to load template: ${contractType}`, error);
      throw error;
    }
  }, [contractType]);
  
  const [formData, setFormData] = useState<Partial<PlaceholderValueMap>>({});
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- PERSISTENCE LOGIC START ---

  // 1. Load data from LocalStorage on mount
  useEffect(() => {
    const storageKey = `contract_draft_${contractType}`;
    const savedData = localStorage.getItem(storageKey);
    const savedClauses = localStorage.getItem(`${storageKey}_clauses`);

    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to restore form data", e);
      }
    }

    if (savedClauses) {
      try {
        setSelectedClauses(JSON.parse(savedClauses));
      } catch (e) {
        console.error("Failed to restore clauses", e);
      }
    }

    // Signals that we are done loading and can now start saving changes
    setIsInitialized(true);
  }, [contractType]);

  // 2. Save data to LocalStorage whenever it changes
  useEffect(() => {
    // Only save if we've finished the initial load, 
    // otherwise we might overwrite saved data with empty state.
    if (isInitialized) {
      const storageKey = `contract_draft_${contractType}`;
      localStorage.setItem(storageKey, JSON.stringify(formData));
      localStorage.setItem(`${storageKey}_clauses`, JSON.stringify(selectedClauses));
    }
  }, [formData, selectedClauses, isInitialized, contractType]);

  // --- PERSISTENCE LOGIC END ---

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateFields = (fields: Partial<PlaceholderValueMap>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const toggleClause = (clauseId: string) => {
    setSelectedClauses((prev) => {
      if (prev.includes(clauseId)) {
        return prev.filter((id) => id !== clauseId);
      }
      return [...prev, clauseId];
    });
  };

  const resetForm = () => {
    const storageKey = `contract_draft_${contractType}`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_clauses`);
    setFormData({});
    setSelectedClauses([]);
  };

  const value: ContractContextType = {
    contractType,
    template,
    formData,
    updateField,
    updateFields,
    selectedClauses,
    toggleClause,
    resetForm,
    isInitialized
  };

  return (
    <ContractContext.Provider value={value}>
      {/* Optional: You can wrap {children} in a loading check 
        if you don't want the user to see empty fields for a split second 
      */}
      {isInitialized ? children : (
        <div className="flex h-96 items-center justify-center">
           <div className="text-gray-400 animate-pulse">Restoring your draft...</div>
        </div>
      )}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error("useContract must be used inside ContractProvider.");
  }
  return context;
}

export type { ContractContextType, PlaceholderValueMap };