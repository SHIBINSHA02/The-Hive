/**
 * generator.ts
 * ------------
 * Contract Generation Engine
 *
 * RESPONSIBILITY:
 * Builds the final contract text by assembling clauses in the correct order
 * and replacing all placeholders using validated values.
 *
 * NOTE:
 * - This module assumes placeholderValues are already validated.
 * - AI is NOT required here. AI refinement happens before generation.
 */

import { contractStructure, ClauseId } from "./structure";
import { coreClauses, CoreClauseId } from "./clauses/core";
import { optionalClauses, OptionalClauseId } from "./clauses/optional";
import { PlaceholderKey, PlaceholderValueMap } from "./placeholders";

/**
 * Input type for contract generation.
 *
 * placeholderValues must contain all required values.
 * selectedOptionalClauses controls which optional sections are included.
 */
export type GenerateContractInput = {
  placeholderValues: PlaceholderValueMap;
  selectedOptionalClauses?: OptionalClauseId[];
};

/**
 * generateContract()
 *
 * Main generator function that produces the final contract text.
 *
 * Steps:
 * 1. Combine core + selected optional clauses
 * 2. Assemble them in correct legal order (structure.ts)
 * 3. Replace placeholders like {{PARTY_A_NAME}} with real values
 * 4. Return final contract text as a string
 */
export function generateContract(input: GenerateContractInput): string {
  const { placeholderValues, selectedOptionalClauses = [] } = input;

  /**
   * Build clause map:
   * - Core clauses are always included
   * - Optional clauses are included only if selected by user
   */
  const allClauses: Partial<Record<ClauseId, string>> = {
    ...coreClauses,
  };

  for (const clauseId of selectedOptionalClauses) {
    allClauses[clauseId] = optionalClauses[clauseId];
  }

  /**
   * Assemble clauses in the exact order defined in structure.ts.
   * This ensures consistent formatting and correct legal flow.
   */
  const orderedClauseTexts: string[] = [];

  for (const clauseId of contractStructure) {
    const clauseText = allClauses[clauseId];

    if (clauseText) {
      orderedClauseTexts.push(clauseText);
    }
  }

  /**
   * Join clauses with spacing between sections.
   */
  let contractText = orderedClauseTexts.join("\n\n");

  /**
   * Replace all placeholders with actual values.
   *
   * Example:
   * "Party A: {{PARTY_A_NAME}}" → "Party A: Acme Corporation"
   *
   * Using split/join ensures replacement for ALL occurrences.
   */
  for (const key in placeholderValues) {
    const placeholderKey = key as PlaceholderKey;
    const value = placeholderValues[placeholderKey];

    const placeholder = `{{${placeholderKey}}}`;
    contractText = contractText.split(placeholder).join(String(value));
  }

  /**
   * Safety fallback:
   * If any placeholders remain, replace them with a visible marker.
   *
   * This should not happen if validatePlaceholders() was used correctly.
   */
  contractText = contractText.replace(/\{\{([^}]+)\}\}/g, "[MISSING: $1]");

  return contractText.trim();
}

/**
 * getRequiredPlaceholders()
 *
 * Extracts all placeholders used by:
 * - all core clauses
 * - selected optional clauses
 *
 * Useful for UI generation, validation, and pre-checking required inputs.
 */
export function getRequiredPlaceholders(
  selectedOptionalClauses: OptionalClauseId[] = []
): PlaceholderKey[] {
  const placeholderPattern = /\{\{([^}]+)\}\}/g;
  const foundPlaceholders = new Set<PlaceholderKey>();

  /**
   * Scan all core clauses for placeholders.
   */
  for (const key in coreClauses) {
    const clauseText = coreClauses[key as CoreClauseId];

    for (const match of clauseText.matchAll(placeholderPattern)) {
      foundPlaceholders.add(match[1] as PlaceholderKey);
    }
  }

  /**
   * Scan selected optional clauses for placeholders.
   */
  for (const clauseId of selectedOptionalClauses) {
    const clauseText = optionalClauses[clauseId];

    for (const match of clauseText.matchAll(placeholderPattern)) {
      foundPlaceholders.add(match[1] as PlaceholderKey);
    }
  }

  return Array.from(foundPlaceholders);
}

/**
 * Typical Flow:
 *
 * 1. Collect user input (UI form)
 * 2. validatePlaceholders() ensures required fields exist
 * 3. (Optional) aiFillPlaceholders() improves allowAI fields
 * 4. generateContract() builds the final contract string
 * 5. Display / Export / PDF
 */
