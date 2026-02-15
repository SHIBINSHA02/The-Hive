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

// ============================================
// TYPE EXPORTS
// ============================================
// Export TypeScript types so they can be used elsewhere

export type { 
  PlaceholderKey,        // Union type of all placeholder names
  PlaceholderValueMap,   // Object mapping placeholder keys to string values
  PlaceholderType        // "string" | "text" | "date"
} from "./placeholders";

export type { ClauseId } from "./structure";
export type { CoreClauseId } from "./clauses/core";
export type { OptionalClauseId } from "./clauses/optional";

// ============================================
// DATA STRUCTURE EXPORTS
// ============================================
// Export the actual placeholder definitions, clauses, etc.

export { contractPlaceholders } from "./placeholders";
export { contractStructure } from "./structure";
export { placeholderAIPermissions } from "./aiPermissions";
export { coreClauses } from "./clauses/core";
export { optionalClauses } from "./clauses/optional";

// ============================================
// FUNCTION EXPORTS
// ============================================
// Export the business logic functions

export { validatePlaceholders } from "./validatePlaceholders";
export { aiFillPlaceholders } from "./aiFillPlaceholders";
export { generateContract, getRequiredPlaceholders } from "./generator";
export { createGeminiClient } from "./geminiClient";

// ============================================
// TEMPLATE CONFIGURATION
// ============================================
/**
 * templateConfig defines metadata about this contract template.
 * 
 * Most important: the 'steps' array tells the UI:
 * - How many steps this contract has
 * - What each step is called
 * - Which placeholder fields belong in each step
 * 
 * The UI reads this to auto-generate the form!
 */
export const templateConfig = {
  // Basic template info
  id: "service-agreement",
  name: "Service Agreement",
  description: "Professional services contract between two parties",
  category: "Services",
  
  // Step configuration - THIS IS THE KEY PART
  // The UI uses this to know which fields to show in each step
  steps: [
    // ==================== STEP 1 ====================
    {
      step: 1,
      title: "Party Information",
      description: "Details about both parties involved in the agreement",
      fields: [
        // Party A (the person creating the contract)
        "PARTY_A_NAME",
        "PARTY_A_TYPE",
        "PARTY_A_ADDRESS",
        "PARTY_A_EMAIL",
        
        // Party B (the other party)
        "PARTY_B_NAME",
        "PARTY_B_TYPE",
        "PARTY_B_ADDRESS",
        "PARTY_B_EMAIL",
      ],
    },
    
    // ==================== STEP 2 ====================
    {
      step: 2,
      title: "Agreement Basics",
      description: "What services and when",
      fields: [
        // Agreement identification
        "AGREEMENT_TITLE",
        "EFFECTIVE_DATE",
        "START_DATE",
        "END_DATE",
        "CONTRACT_TERM_DESCRIPTION",
        
        // Service details
        "SERVICE_DESCRIPTION",
        "DELIVERABLES",
        "SERVICE_LOCATION",
      ],
    },
    
    // ==================== STEP 3 ====================
    {
      step: 3,
      title: "Payment Terms",
      description: "Financial details and payment schedule",
      fields: [
        // Payment basics
        "PAYMENT_AMOUNT",
        "PAYMENT_CURRENCY",
        "PAYMENT_SCHEDULE",
        "PAYMENT_METHOD",
        
        // Additional financial terms
        "LATE_PAYMENT_INTEREST",
        "TAXES_DESCRIPTION",
      ],
    },
    
    // ==================== STEP 4 ====================
    {
      step: 4,
      title: "Legal Protection",
      description: "Important legal terms and protections",
      fields: [
        // Confidentiality & IP
        "CONFIDENTIALITY_TERM",
        "IP_OWNERSHIP_MODEL",
        
        // Liability
        "LIABILITY_CAP",
        
        // Jurisdiction
        "GOVERNING_LAW_STATE",
        "GOVERNING_LAW_COUNTRY",
        
        // Dispute resolution
        "DISPUTE_RESOLUTION_METHOD",
        "ARBITRATION_LOCATION",
      ],
    },
    
    // ==================== STEP 5 ====================
    {
      step: 5,
      title: "Optional Clauses & Signatures",
      description: "Additional clauses and signatory information",
      fields: [
        // Notice information
        "NOTICE_METHOD",
        "NOTICE_ADDRESS_PARTY_A",
        "NOTICE_ADDRESS_PARTY_B",
        
        // Signatory information
        "PARTY_A_SIGNATORY_NAME",
        "PARTY_A_SIGNATORY_TITLE",
        "PARTY_B_SIGNATORY_NAME",
        "PARTY_B_SIGNATORY_TITLE",
      ],
    },
  ],
} as const;

/**
 * Type helper: Extract step configuration type
 * This ensures TypeScript knows the structure of our steps
 */
export type TemplateConfig = typeof templateConfig;