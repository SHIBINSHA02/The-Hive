/**
 * service-agreement/index.ts
 * ---------------------------
 * Central export file for Service Agreement contract template.
 * 
 * This file does 3 things:
 * 1. Re-exports all types, data, and functions from other files
 * 2. Defines templateConfig (which fields go in which step)
 * 3. Allows importing entire template with: import * as serviceAgreement from './service-agreement'
 * 
 * Why this exists:
 * - Clean imports: One import instead of 10 separate imports
 * - Step configuration: Tells UI which fields belong to each step
 * - Future-proof: Easy to add metadata about this contract type
 */

"use client";

// ============================================
// TYPE EXPORTS
// ============================================

export type { 
  PlaceholderDefinition,
  PlaceholderKey,
  PlaceholderValueMap,
  PlaceholderType 
} from "./placeholders";

export type { ClauseId } from "./structure";
export type { CoreClauseId } from "./clauses/core";
export type { OptionalClauseId } from "./clauses/optional";

/**
 * UPDATED: Export the new input type from generator.ts
 * This ensures the Preview page and API know exactly what 
 * properties (like 'isDraft') are allowed.
 */
export type { GenerateContractInput } from "./generator";

// ============================================
// DATA STRUCTURE EXPORTS
// ============================================

export { contractPlaceholders } from "./placeholders";
export { contractStructure } from "./structure";
export { placeholderAIPermissions } from "./aiPermissions";
export { coreClauses } from "./clauses/core";
export { optionalClauses } from "./clauses/optional";

// ============================================
// FUNCTION EXPORTS
// ============================================

export { validatePlaceholders } from "./validatePlaceholders";
export { aiFillPlaceholders } from "./aiFillPlaceholders";
export { generateContract, getUsedPlaceholders } from "./generator";
export { createGeminiClient } from "./geminiClient";

// ============================================
// TEMPLATE CONFIGURATION
// ============================================

export const templateConfig = {
  id: "service-agreement",
  name: "Service Agreement",
  description: "Professional services contract between two parties",
  category: "Services",
  
  // Steps tell the UI how to distribute fields across the 5-step form
  steps: [
    {
      step: 1,
      title: "Party Information",
      description: "Details about both parties involved in the agreement",
      fields: [
        "PARTY_A_NAME", "PARTY_A_TYPE", "PARTY_A_ADDRESS", "PARTY_A_EMAIL",
        "PARTY_B_NAME", "PARTY_B_TYPE", "PARTY_B_ADDRESS", "PARTY_B_EMAIL",
      ],
    },
    {
      step: 2,
      title: "Agreement Basics",
      description: "What services and when",
      fields: [
        "AGREEMENT_TITLE", "EFFECTIVE_DATE", "START_DATE", "END_DATE", 
        "CONTRACT_TERM_DESCRIPTION", "SERVICE_DESCRIPTION", "DELIVERABLES", "SERVICE_LOCATION",
      ],
    },
    {
      step: 3,
      title: "Payment Terms",
      description: "Financial details and payment schedule",
      fields: [
        "PAYMENT_AMOUNT", "PAYMENT_CURRENCY", "PAYMENT_SCHEDULE", 
        "PAYMENT_METHOD", "LATE_PAYMENT_INTEREST", "TAXES_DESCRIPTION",
      ],
    },
    {
      step: 4,
      title: "Legal Protection",
      description: "Important legal terms and protections",
      fields: [
        "CONFIDENTIALITY_TERM", "IP_OWNERSHIP_MODEL", "LIABILITY_CAP", 
        "GOVERNING_LAW_STATE", "GOVERNING_LAW_COUNTRY", "DISPUTE_RESOLUTION_METHOD", "ARBITRATION_LOCATION",
      ],
    },
    {
      step: 5,
      title: "Optional Clauses & Signatures",
      description: "Additional clauses and signatory information",
      fields: [
        "NOTICE_METHOD", "NOTICE_ADDRESS_PARTY_A", "NOTICE_ADDRESS_PARTY_B",
        "PARTY_A_SIGNATORY_NAME", "PARTY_A_SIGNATORY_TITLE", 
        "PARTY_B_SIGNATORY_NAME", "PARTY_B_SIGNATORY_TITLE",
      ],
    },
  ],
} as const;

export type TemplateConfig = typeof templateConfig;