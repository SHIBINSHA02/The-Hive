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
  isInitialized: boolean; 
  userProfile: any;
  creatorRole: 'client' | 'contractor' | null;
  setCreatorRole: (role: 'client' | 'contractor' | null) => void;
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [creatorRole, setCreatorRole] = useState<'client' | 'contractor' | null>(null);

  // --- PERSISTENCE LOGIC START ---

  // 1. Load data from LocalStorage on mount
  useEffect(() => {
    async function loadData() {
      const storageKey = `contract_draft_${contractType}`;
      const savedData = localStorage.getItem(storageKey);
      const savedClauses = localStorage.getItem(`${storageKey}_clauses`);

      let initialFormData: Partial<PlaceholderValueMap> = {};

      if (savedData) {
        try {
          initialFormData = JSON.parse(savedData);
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

      // Fetch user profile for auto-fill
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const profileData = await res.json();
          setUserProfile(profileData);
          
          // Determine initial creator role based on available profiles
          if (profileData.contractorProfile) {
            setCreatorRole('contractor');
          } else if (profileData.clientProfile) {
            setCreatorRole('client');
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile for auto-fill", err);
      }

      setFormData(initialFormData);
      setIsInitialized(true);
    }

    loadData();
  }, [contractType]);

  // Handle Role Auto-fill when creatorRole changes
  useEffect(() => {
    if (!isInitialized || !userProfile || !creatorRole) return;

    setFormData(prev => {
      const next = { ...prev };
      if (creatorRole === 'contractor' && userProfile.contractorProfile) {
        next.PARTY_B_NAME = userProfile.contractorProfile.name || next.PARTY_B_NAME;
        next.PARTY_B_EMAIL = userProfile.user.email || next.PARTY_B_EMAIL;
        next.PARTY_B_SIGNATORY_NAME = userProfile.contractorProfile.name || next.PARTY_B_SIGNATORY_NAME;
        
        // Clear Party A if it was auto-filled previously? 
        // User said: "other parties should be manually entered as usual"
        // So we leave them alone.
      } else if (creatorRole === 'client' && userProfile.clientProfile) {
        next.PARTY_A_NAME = userProfile.clientProfile.name || next.PARTY_A_NAME;
        next.PARTY_A_EMAIL = userProfile.user.email || next.PARTY_A_EMAIL;
        next.PARTY_A_SIGNATORY_NAME = userProfile.clientProfile.name || next.PARTY_A_SIGNATORY_NAME;
      }
      return next;
    });
  }, [creatorRole, isInitialized, userProfile]);

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
    isInitialized,
    userProfile,
    creatorRole,
    setCreatorRole
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