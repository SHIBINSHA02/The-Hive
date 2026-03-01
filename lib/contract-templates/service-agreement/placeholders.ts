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
 * - label: UI label shown in frontend forms
 * - placeholder: UI placeholder text shown inside input fields
 *
 * WHY THIS FILE EXISTS:
 * - Used to auto-generate frontend input forms dynamically
 * - Used for datatype validation (date/string/text)
 * - Used to determine required fields automatically (no need for a separate file)
 *
 * NOTE:
 * AI permissions are NOT stored here.
 * AI rules are stored separately in `aiPermissions.ts`.
 */

export type PlaceholderType = "string" | "date" | "text";

export type PlaceholderDefinition = {
  type: PlaceholderType;
  required: boolean;

  // UI metadata (for frontend auto form generation)
  label: string;
  placeholder: string;
};

export const contractPlaceholders = {
  // -------------------------------
  // Basic Agreement Info
  // -------------------------------
  AGREEMENT_TITLE: {
    type: "string",
    required: true,
    label: "Agreement Title",
    placeholder: "e.g., Service Agreement",
  },

  EFFECTIVE_DATE: {
    type: "date",
    required: true,
    label: "Effective Date",
    placeholder: "Select effective date",
  },

  // -------------------------------
  // Party A Details
  // -------------------------------
  PARTY_A_NAME: {
    type: "string",
    required: true,
    label: "Party A Name",
    placeholder: "Enter Party A full name / company name",
  },

  PARTY_A_TYPE: {
    type: "string",
    required: true,
    label: "Party A Type",
    placeholder: "e.g., Individual / Company",
  },

  PARTY_A_ADDRESS: {
    type: "text",
    required: true,
    label: "Party A Address",
    placeholder: "Enter full address of Party A",
  },

  PARTY_A_EMAIL: {
    type: "string",
    required: true,
    label: "Party A Email",
    placeholder: "Enter Party A email address",
  },

  // -------------------------------
  // Party B Details
  // -------------------------------
  PARTY_B_NAME: {
    type: "string",
    required: true,
    label: "Party B Name",
    placeholder: "Enter Party B full name / company name",
  },

  PARTY_B_TYPE: {
    type: "string",
    required: true,
    label: "Party B Type",
    placeholder: "e.g., Individual / Company",
  },

  PARTY_B_ADDRESS: {
    type: "text",
    required: true,
    label: "Party B Address",
    placeholder: "Enter full address of Party B",
  },

  PARTY_B_EMAIL: {
    type: "string",
    required: true,
    label: "Party B Email",
    placeholder: "Enter Party B email address",
  },

  // -------------------------------
  // Scope / Services
  // -------------------------------
  SERVICE_DESCRIPTION: {
    type: "text",
    required: true,
    label: "Service Description",
    placeholder: "Describe what service is being provided",
  },

  DELIVERABLES: {
    type: "text",
    required: true,
    label: "Deliverables",
    placeholder: "List the deliverables expected from the service",
  },

  SERVICE_LOCATION: {
    type: "string",
    required: true,
    label: "Service Location",
    placeholder: "e.g., Remote / On-site / City name",
  },

  // -------------------------------
  // Time / Term
  // -------------------------------
  START_DATE: {
    type: "date",
    required: true,
    label: "Start Date",
    placeholder: "Select contract start date",
  },

  END_DATE: {
    type: "date",
    required: true,
    label: "End Date",
    placeholder: "Select contract end date",
  },

  CONTRACT_TERM_DESCRIPTION: {
    type: "text",
    required: false,
    label: "Contract Term Description (Optional)",
    placeholder: "Optional notes about term duration",
  },

  // -------------------------------
  // Payment
  // -------------------------------
  PAYMENT_AMOUNT: {
    type: "string",
    required: true,
    label: "Payment Amount",
    placeholder: "e.g., 5000",
  },

  PAYMENT_CURRENCY: {
    type: "string",
    required: true,
    label: "Payment Currency",
    placeholder: "e.g., USD / INR",
  },

  PAYMENT_SCHEDULE: {
    type: "string",
    required: true,
    label: "Payment Schedule",
    placeholder: "e.g., Monthly / Milestone-based",
  },

  PAYMENT_METHOD: {
    type: "string",
    required: true,
    label: "Payment Method",
    placeholder: "e.g., Bank Transfer / UPI",
  },

  // -------------------------------
  // Late Fees / Taxes
  // -------------------------------
  LATE_PAYMENT_INTEREST: {
    type: "string",
    required: false,
    label: "Late Payment Interest (Optional)",
    placeholder: "e.g., 2% per month",
  },

  TAXES_DESCRIPTION: {
    type: "text",
    required: false,
    label: "Taxes Description (Optional)",
    placeholder: "Explain tax handling if applicable",
  },

  // -------------------------------
  // Confidentiality
  // -------------------------------
  CONFIDENTIALITY_TERM: {
    type: "string",
    required: true,
    label: "Confidentiality Term",
    placeholder: "e.g., 2 years",
  },

  // -------------------------------
  // Intellectual Property
  // -------------------------------
  IP_OWNERSHIP_MODEL: {
    type: "string",
    required: true,
    label: "IP Ownership Model",
    placeholder: "e.g., Client owns all work / Contractor retains rights",
  },

  // -------------------------------
  // Liability
  // -------------------------------
  LIABILITY_CAP: {
    type: "string",
    required: true,
    label: "Liability Cap",
    placeholder: "e.g., Total contract value",
  },

  // -------------------------------
  // Governing Law & Jurisdiction
  // -------------------------------
  GOVERNING_LAW_STATE: {
    type: "string",
    required: true,
    label: "Governing Law State",
    placeholder: "e.g., Kerala",
  },

  GOVERNING_LAW_COUNTRY: {
    type: "string",
    required: true,
    label: "Governing Law Country",
    placeholder: "e.g., India",
  },

  // -------------------------------
  // Dispute Resolution
  // -------------------------------
  DISPUTE_RESOLUTION_METHOD: {
    type: "string",
    required: true,
    label: "Dispute Resolution Method",
    placeholder: "e.g., Arbitration / Court",
  },

  ARBITRATION_LOCATION: {
    type: "string",
    required: false,
    label: "Arbitration Location (Optional)",
    placeholder: "Enter arbitration location if applicable",
  },

  // -------------------------------
  // Notices
  // -------------------------------
  NOTICE_METHOD: {
    type: "string",
    required: true,
    label: "Notice Method",
    placeholder: "e.g., Email / Registered Mail",
  },

  NOTICE_ADDRESS_PARTY_A: {
    type: "text",
    required: true,
    label: "Notice Address (Party A)",
    placeholder: "Enter notice address for Party A",
  },

  NOTICE_ADDRESS_PARTY_B: {
    type: "text",
    required: true,
    label: "Notice Address (Party B)",
    placeholder: "Enter notice address for Party B",
  },

  // -------------------------------
  // Signature Fields
  // -------------------------------
  PARTY_A_SIGNATORY_NAME: {
    type: "string",
    required: true,
    label: "Party A Signatory Name",
    placeholder: "Enter authorized signatory name",
  },

  PARTY_A_SIGNATORY_TITLE: {
    type: "string",
    required: true,
    label: "Party A Signatory Title",
    placeholder: "e.g., CEO / Manager",
  },

  PARTY_B_SIGNATORY_NAME: {
    type: "string",
    required: true,
    label: "Party B Signatory Name",
    placeholder: "Enter authorized signatory name",
  },

  PARTY_B_SIGNATORY_TITLE: {
    type: "string",
    required: true,
    label: "Party B Signatory Title",
    placeholder: "e.g., CEO / Manager",
  },
} as const;

/**
 * Type helper:
 * Creates a union type of all placeholder keys.
 * Example: "PARTY_A_NAME" | "PAYMENT_AMOUNT" | ...
 */
export type PlaceholderKey = keyof typeof contractPlaceholders;

/**
 * Type helper:
 * Creates an object type mapping placeholder keys to their string values.
 * Used for storing actual placeholder data when generating contracts.
 */
export type PlaceholderValueMap = Record<PlaceholderKey, string>;
