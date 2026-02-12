/**
 * placeholders.ts
 * ---------------
 * This file defines the list of allowed placeholders (dynamic variables)
 * that can be used inside contract clauses.
 *
 * Why this file exists:
 * - Prevents AI (Gemini) from inventing random fields.
 * - Makes contract generation consistent and structured.
 * - Helps validation: we can ensure all required placeholders are provided.
 * - Can later be used to auto-generate UI forms.
 *
 * How it is used:
 * - Clause text will include placeholders like: {{CLIENT_NAME}}
 * - The generator replaces placeholders with actual user-provided values
 *   (or AI-generated values if permitted).
 *
 * Important:
 * - Every placeholder must be written in ALL CAPS with underscores.
 * - Keep names stable, because changing a placeholder breaks existing clauses.
 */

export const contractPlaceholders = {
  // Basic Agreement Info
  AGREEMENT_TITLE: "string",
  EFFECTIVE_DATE: "date",

  // Party Details
  PARTY_A_NAME: "string",
  PARTY_A_TYPE: "string", // Individual / Company
  PARTY_A_ADDRESS: "string",
  PARTY_A_EMAIL: "string",

  PARTY_B_NAME: "string",
  PARTY_B_TYPE: "string",
  PARTY_B_ADDRESS: "string",
  PARTY_B_EMAIL: "string",

  // Scope / Services
  SERVICE_DESCRIPTION: "text",
  DELIVERABLES: "text",
  SERVICE_LOCATION: "string",

  // Time / Term
  START_DATE: "date",
  END_DATE: "date",
  CONTRACT_TERM_DESCRIPTION: "text", // optional: "until completion of services"

  // Payment
  PAYMENT_AMOUNT: "string", // keep string for now, later can enforce currency type
  PAYMENT_CURRENCY: "string",
  PAYMENT_SCHEDULE: "string", // monthly / milestone / one-time
  PAYMENT_METHOD: "string",

  // Late Fees / Taxes
  LATE_PAYMENT_INTEREST: "string",
  TAXES_DESCRIPTION: "text",

  // Confidentiality
  CONFIDENTIALITY_TERM: "string", // e.g. "2 years", "5 years", "indefinite"

  // Intellectual Property
  IP_OWNERSHIP_MODEL: "string", // Client owns / Provider owns / Shared

  // Liability
  LIABILITY_CAP: "string",

  // Governing Law & Jurisdiction
  GOVERNING_LAW_STATE: "string",
  GOVERNING_LAW_COUNTRY: "string",

  // Dispute Resolution
  DISPUTE_RESOLUTION_METHOD: "string", // arbitration / court / mediation
  ARBITRATION_LOCATION: "string",

  // Notices
  NOTICE_METHOD: "string", // email / registered mail
  NOTICE_ADDRESS_PARTY_A: "string",
  NOTICE_ADDRESS_PARTY_B: "string",

  // Signature Fields
  PARTY_A_SIGNATORY_NAME: "string",
  PARTY_A_SIGNATORY_TITLE: "string",

  PARTY_B_SIGNATORY_NAME: "string",
  PARTY_B_SIGNATORY_TITLE: "string",
} as const;

/**
 * Type helper:
 * Creates a union type of all placeholder keys.
 * Example: PlaceholderKey = "PARTY_A_NAME" | "PARTY_B_NAME" | ...
 */
export type PlaceholderKey = keyof typeof contractPlaceholders;
