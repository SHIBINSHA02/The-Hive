/**
 * structure.ts
 * -----------
 * This file defines the "contract blueprint" (the fixed order of sections/clauses)
 * for the General Business Agreement template.
 *
 * Why this file exists:
 * - A contract must follow a consistent legal structure.
 * - Clause ordering should NOT be decided by AI (Gemini), because AI may reorder,
 *   skip, or insert sections unpredictably.
 * - The contract generator will use this structure array to assemble the final
 *   contract document by fetching clause content in this exact order.
 *
 * How it is used:
 * - The generator reads this list top-to-bottom.
 * - For each clause ID, it loads the matching clause text from:
 *      /clauses/core/
 *      /clauses/optional/
 * - Core clauses must always be included.
 * - Optional clauses are included only if selected by the user.
 *
 * Important:
 * - The IDs here must exactly match the clause file IDs.
 * - Do not rename IDs unless you update the corresponding clause files.
 */

export const contractStructure = [
  // Title / Heading
  "title",

  // Core Legal Sections
  "parties",
  "effective_date",
  "background", // also known as "recitals"
  "definitions",
  "scope_of_services",

  // Commercial Terms
  "payment_terms",
  "expenses",

  // Legal Protection Clauses
  "confidentiality",
  "intellectual_property",
  "data_protection",
  "non_solicitation",

  // Contract Management
  "term_and_termination",
  "indemnification",
  "limitation_of_liability",

  // Legal Boilerplate
  "force_majeure",
  "dispute_resolution",
  "governing_law",
  "notices",
  "assignment",
  "amendments",
  "severability",
  "entire_agreement",

  // Final Execution
  "signatures",
] as const;

/**
 * Type helper:
 * This creates a union type of all clause IDs in the structure.
 *
 * Example:
 * ClauseId = "title" | "parties" | "effective_date" | ...
 *
 * This is useful for type safety in your generator.
 */
export type ClauseId = (typeof contractStructure)[number];
