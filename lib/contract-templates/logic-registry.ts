/**
 * logic-registry.ts
 * -----------------
 * A server-safe registry that ONLY imports business logic (validation, generation, AI).
 * It strictly avoids importing React components or UI configs to prevent API crashes.
 * Manual importing must be done here.
 */

import { validatePlaceholders as validateService } from "./service-agreement/validatePlaceholders";
import { generateContract as generateService } from "./service-agreement/generator";
import { contractPlaceholders as placeholdersService } from "./service-agreement/placeholders";
import { aiFillPlaceholders as aiFillService } from "./service-agreement/aiFillPlaceholders";

// Define a generic shape so future contracts (like NDA) don't cause TS errors
export interface ContractLogicModule {
  validate: (input: any) => { 
    isValid: boolean; 
    missingRequired: string[]; 
    datatypeErrors: any[] 
  };
  
  generate: (params: {
    placeholderValues: any;
    selectedOptionalClauses: any;
    isDraft: boolean;
  }) => string;
  
  placeholders: Record<string, any>;
  
  aiFill: (client: any, params: {
    userValues: Record<string, string>;
    keysToRefine: string[];
  }) => Promise<Record<string, string>>;
}

// Register the modules. We cast them `as any` here because we are crossing 
// the boundary from "Strict Service Agreement Types" to "Generic Registry Types"
export const LOGIC_REGISTRY: Record<string, ContractLogicModule> = {
  "service-agreement": {
    validate: validateService as any,
    generate: generateService as any,
    placeholders: placeholdersService,
    aiFill: aiFillService as any,
  }
};

export type ContractType = keyof typeof LOGIC_REGISTRY;

// Helper to get logic without touching UI code
export function getContractLogic(contractType: string): ContractLogicModule {
  const logic = LOGIC_REGISTRY[contractType];
  
  if (!logic) {
    throw new Error(`Unknown contract type: '${contractType}'`);
  }
  return logic;
}