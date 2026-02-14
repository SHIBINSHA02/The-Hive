/**
 * placeholders.ts
 * ----------------
 * This file defines all placeholders used in the Service Agreement template.
 *
 * Each placeholder represents a variable field that will be replaced inside
 * contract clauses during contract generation.
 *
 * Example usage in clause text:
 *   "This Agreement is made between {{PARTY_A_NAME}} and {{PARTY_B_NAME}}..."
 *
 * Each placeholder includes:
 * - type: the datatype (string | date | text)
 * - required: whether the field must be filled to generate a valid contract
 *
 * WHY THIS FILE EXISTS:
 * - Used to auto-generate frontend input forms
 * - Used for datatype validation (date/string/text)
 * - Used to determine required fields automatically (no need for a separate file)
 *
 * NOTE:
 * AI permissions are NOT stored here.
 * AI rules are stored separately in `aiPermissions.ts`.
 */

export type PlaceholderType = "string" | "date" | "text";

export const contractPlaceholders = {
  // Basic Agreement Info
  AGREEMENT_TITLE: { type: "string", required: true },
  EFFECTIVE_DATE: { type: "date", required: true },

  // Party Details
  PARTY_A_NAME: { type: "string", required: true },
  PARTY_A_TYPE: { type: "string", required: true }, // Individual / Company
  PARTY_A_ADDRESS: { type: "string", required: true },
  PARTY_A_EMAIL: { type: "string", required: true },

  PARTY_B_NAME: { type: "string", required: true },
  PARTY_B_TYPE: { type: "string", required: true },
  PARTY_B_ADDRESS: { type: "string", required: true },
  PARTY_B_EMAIL: { type: "string", required: true },

  // Scope / Services
  SERVICE_DESCRIPTION: { type: "text", required: true },
  DELIVERABLES: { type: "text", required: true },
  SERVICE_LOCATION: { type: "string", required: true },

  // Time / Term
  START_DATE: { type: "date", required: true },
  END_DATE: { type: "date", required: true },
  CONTRACT_TERM_DESCRIPTION: { type: "text", required: false },

  // Payment
  PAYMENT_AMOUNT: { type: "string", required: true },
  PAYMENT_CURRENCY: { type: "string", required: true },
  PAYMENT_SCHEDULE: { type: "string", required: true },
  PAYMENT_METHOD: { type: "string", required: true },

  // Late Fees / Taxes
  LATE_PAYMENT_INTEREST: { type: "string", required: false },
  TAXES_DESCRIPTION: { type: "text", required: false },

  // Confidentiality
  CONFIDENTIALITY_TERM: { type: "string", required: true },

  // Intellectual Property
  IP_OWNERSHIP_MODEL: { type: "string", required: true },

  // Liability
  LIABILITY_CAP: { type: "string", required: true },

  // Governing Law & Jurisdiction
  GOVERNING_LAW_STATE: { type: "string", required: true },
  GOVERNING_LAW_COUNTRY: { type: "string", required: true },

  // Dispute Resolution
  DISPUTE_RESOLUTION_METHOD: { type: "string", required: true },
  ARBITRATION_LOCATION: { type: "string", required: false },

  // Notices
  NOTICE_METHOD: { type: "string", required: true },
  NOTICE_ADDRESS_PARTY_A: { type: "string", required: true },
  NOTICE_ADDRESS_PARTY_B: { type: "string", required: true },

  // Signature Fields
  PARTY_A_SIGNATORY_NAME: { type: "string", required: true },
  PARTY_A_SIGNATORY_TITLE: { type: "string", required: true },

  PARTY_B_SIGNATORY_NAME: { type: "string", required: true },
  PARTY_B_SIGNATORY_TITLE: { type: "string", required: true },
} as const;

/**
 * Type helper:
 * Creates a union type of all placeholder keys.
 * Example: "PARTY_A_NAME" | "PAYMENT_AMOUNT" | ...
 */
export type PlaceholderKey = keyof typeof contractPlaceholders;

/**
 * Type helper:
 * Extracts the allowed placeholder type for a given key.
 */
export type PlaceholderDefinition = (typeof contractPlaceholders)[PlaceholderKey];
