/**
 * logic-registry.ts
 * -----------------
 * A server-safe registry that ONLY imports business logic (validation, generation).
 * It strictly avoids importing React components or UI configs to prevent API crashes.
 */

import { validatePlaceholders as validateService } from "./service-agreement/validatePlaceholders";
import { generateContract as generateService } from "./service-agreement/generator";
import { contractPlaceholders as placeholdersService } from "./service-agreement/placeholders";

// Define the shape of a logic module (Pure Typescript)
export interface ContractLogicModule {
  validate: typeof validateService;
  generate: typeof generateService;
  placeholders: typeof placeholdersService;
}

// Register the modules
const LOGIC_REGISTRY: Record<string, ContractLogicModule> = {
  "service-agreement": {
    validate: validateService,
    generate: generateService,
    placeholders: placeholdersService
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