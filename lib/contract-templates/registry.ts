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

/**
 * 1. Define a Base Interface for all templates.
 * This ensures that when we add "NDA" or "Employment" later, 
 * TypeScript will yell at us if we forget to include 'generateContract' or 'templateConfig'.
 */
export interface ContractTemplateModule {
  templateConfig: any; // We use any here because different templates have different step counts
  contractPlaceholders: any;
  placeholderAIPermissions: any;
  generateContract: (input: serviceAgreement.GenerateContractInput) => string;
  validatePlaceholders: (values: any) => { isValid: boolean; missingRequired: string[]; datatypeErrors: any[] };
  optionalClauses: Record<string, string>;
  coreClauses: Record<string, string>;
}

export const TEMPLATE_REGISTRY = {
  "service-agreement": serviceAgreement as ContractTemplateModule,
  // "nda": nda as ContractTemplateModule,
} as const;

export type ContractType = keyof typeof TEMPLATE_REGISTRY;

// ============================================
// REGISTRY HELPERS
// ============================================

/**
 * Returns the full contract template module.
 * * UPDATED: Explicitly typed as ContractTemplateModule to ensure 
 * the 'isDraft' property and other new types are recognized.
 */
export function getContractTemplate(contractType: string): ContractTemplateModule {
  if (!(contractType in TEMPLATE_REGISTRY)) {
    const availableTypes = Object.keys(TEMPLATE_REGISTRY).join(", ");
    throw new Error(
      `Unknown contract type: '${contractType}'. Available types: ${availableTypes}`
    );
  }

  return TEMPLATE_REGISTRY[contractType as ContractType];
}

export function getAvailableContractTypes(): ContractType[] {
  return Object.keys(TEMPLATE_REGISTRY) as ContractType[];
}

export function getAllTemplateConfigs() {
  return Object.entries(TEMPLATE_REGISTRY).map(([key, template]) => ({
    contractType: key as ContractType,
    ...(template as any).templateConfig,
  }));
}

export function isValidContractType(
  contractType: string
): contractType is ContractType {
  return contractType in TEMPLATE_REGISTRY;
}

export function getStepConfig(contractType: string, stepNumber: number) {
  const template = getContractTemplate(contractType);
  return (template as any).templateConfig.steps.find((s: any) => s.step === stepNumber);
}