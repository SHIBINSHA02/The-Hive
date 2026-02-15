/**
 * registry.ts
 * -----------
 * Central registry of all contract templates available in the system.
 *
 * PURPOSE:
 * This file acts as the single source of truth for:
 * - What contract types exist
 * - How the frontend can load them dynamically
 * - How API endpoints can validate contract type input
 *
 * When you add a new template folder (ex: /nda, /employment),
 * you need to create an index.ts for that contract type, and
 * you only need to import it here and register it in TEMPLATE_REGISTRY.
 *
 * This design allows the UI and backend to stay scalable without hardcoding.
 */

// ============================================
// TEMPLATE IMPORTS
// ============================================
// Each contract template is a module that exports:
// - templateConfig (metadata + step form layout)
// - placeholders, clauses, validation, generator, AI integration, etc.

import * as serviceAgreement from "./service-agreement";

// Future templates:
// import * as nda from "./nda";
// import * as employment from "./employment";

// ============================================
// TEMPLATE REGISTRY
// ============================================
/**
 * Maps a contract type ID → template module.
 *
 * The key is used in:
 * - URLs (query params)
 * - API requests
 * - database contract type storage
 *
 * Example:
 * /create-contract/step-1?type=service-agreement
 *                          ↑ must exist here
 */
export const TEMPLATE_REGISTRY = {
  "service-agreement": serviceAgreement,

  // Add more templates here:
  // "nda": nda,
  // "employment": employment,
} as const;

// ============================================
// TYPES
// ============================================

/**
 * Type-safe union of valid contract type IDs.
 *
 * Example output:
 * "service-agreement" | "nda" | "employment"
 *
 * This prevents invalid contract types from being used accidentally.
 */
export type ContractType = keyof typeof TEMPLATE_REGISTRY;

// ============================================
// REGISTRY HELPERS
// ============================================

/**
 * Returns the full contract template module for a given contract type.
 *
 * This is the main loader function used by:
 * - frontend UI (to generate step forms)
 * - backend API (to validate + generate contract)
 *
 * @param contractType - Contract type string (example: "service-agreement")
 * @throws Error if the contract type is not registered
 */
export function getContractTemplate(contractType: string) {
  if (!(contractType in TEMPLATE_REGISTRY)) {
    const availableTypes = Object.keys(TEMPLATE_REGISTRY).join(", ");

    throw new Error(
      `Unknown contract type: '${contractType}'. Available types: ${availableTypes}`
    );
  }

  return TEMPLATE_REGISTRY[contractType as ContractType];
}

/**
 * Returns all available contract type IDs.
 *
 * Useful for:
 * - dropdown options
 * - validations
 * - displaying available contract types in UI
 */
export function getAvailableContractTypes(): ContractType[] {
  return Object.keys(TEMPLATE_REGISTRY) as ContractType[];
}

/**
 * Returns templateConfig for every registered contract type.
 *
 * Used mainly in the contract selection page where you show
 * a list of contract types to choose from.
 */
export function getAllTemplateConfigs() {
  return Object.entries(TEMPLATE_REGISTRY).map(([key, template]) => ({
    contractType: key as ContractType,
    ...template.templateConfig,
  }));
}

/**
 * Type guard utility for validating contract type strings.
 *
 * Useful when reading from:
 * - query params
 * - request bodies
 * - database fields
 */
export function isValidContractType(
  contractType: string
): contractType is ContractType {
  return contractType in TEMPLATE_REGISTRY;
}

/**
 * Returns the step configuration for a given contract type and step number.
 *
 * Useful when rendering multi-step forms:
 * Step 1 = Party Info
 * Step 2 = Agreement Basics
 * Step 3 = Payment Terms
 * etc.
 *
 * @param contractType - Contract type string
 * @param stepNumber - Step number (1-based)
 */
export function getStepConfig(contractType: string, stepNumber: number) {
  const template = getContractTemplate(contractType);
  return template.templateConfig.steps.find((s) => s.step === stepNumber);
}
