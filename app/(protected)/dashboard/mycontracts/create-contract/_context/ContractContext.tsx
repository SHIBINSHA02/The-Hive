"use client";

import React, { createContext, useContext, useState } from "react";

export type ContractData = {
  contractorName: string;
  contractorAddress: string;
  clientName: string;
  clientAddress: string;
  companyName?: string;
  companyLogoUrl?: string;
  introduction?: string;
};

type ContractContextType = {
  data: ContractData;
  updateData: (values: Partial<ContractData>) => void;
};

const ContractContext = createContext<ContractContextType | null>(null);

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ContractData>({
    contractorName: "",
    contractorAddress: "",
    clientName: "",
    clientAddress: "",
  });

  const updateData = (values: Partial<ContractData>) =>
    setData((prev) => ({ ...prev, ...values }));

  return (
    <ContractContext.Provider value={{ data, updateData }}>
      {children}
    </ContractContext.Provider>
  );
}

export const useContract = () => {
  const ctx = useContext(ContractContext);
  if (!ctx) {
    throw new Error("useContract must be used inside ContractProvider");
  }
  return ctx;
};
