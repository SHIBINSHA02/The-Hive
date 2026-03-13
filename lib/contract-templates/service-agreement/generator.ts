/**
 * generator.ts
 * ------------
 * The engine that assembles legal text.
 * * DESIGN PHILOSOPHY:
 * 1. Deterministic: Clauses are always in the order defined in structure.ts.
 * 2. Safe: If a field is missing, it shows a visible marker [MISSING: KEY] instead of a blank space.
 * 3. Preview-Friendly: The 'isDraft' flag allows the UI to render incomplete contracts during editing.
 */

import { contractStructure, ClauseId } from "./structure";
import { coreClauses, CoreClauseId } from "./clauses/core";
import { optionalClauses, OptionalClauseId } from "./clauses/optional";
import { PlaceholderKey, PlaceholderValueMap, contractPlaceholders } from "./placeholders";
import { validatePlaceholders } from "./validatePlaceholders";

/**
 * Input configuration for the generator.
 * * @param placeholderValues - The current form data from the UI.
 * @param selectedOptionalClauses - IDs of optional clauses selected in Step 5.
 * @param isDraft - If true, validation errors won't throw an exception (useful for Preview).
 */
export type GenerateContractInput = {
  placeholderValues: Partial<PlaceholderValueMap>;
  selectedOptionalClauses?: string[];
  isDraft?: boolean;
};

/**
 * Main assembly function.
 */
export function generateContract(input: GenerateContractInput): string {
  const { 
    placeholderValues, 
    selectedOptionalClauses = [], 
    isDraft = false 
  } = input;

  /**
   * STEP 1: Validation
   * We cast placeholderValues as the full Map for the validator's benefit,
   * but we only throw a hard error if isDraft is false (Final Generation).
   */
  const validation = validatePlaceholders(placeholderValues as PlaceholderValueMap);

  if (!validation.isValid && !isDraft) {
    const missing = validation.missingRequired.join(", ");
    const datatypeErrors = validation.datatypeErrors.map((e) => e.key).join(", ");

    let errorMessage = "Validation failed.";
    if (validation.missingRequired.length > 0) errorMessage += ` Missing: ${missing}.`;
    if (validation.datatypeErrors.length > 0) errorMessage += ` Invalid formats: ${datatypeErrors}.`;

    throw new Error(errorMessage);
  }

  /**
   * STEP 2: Clause Collection
   * Start with core clauses, then add optional ones if they are valid IDs.
   */
  const allClauses: Partial<Record<ClauseId, string>> = {
    ...coreClauses,
  };

  for (const clauseId of selectedOptionalClauses) {
    // Safety check: ensure the string from the UI actually exists in our template
    if (clauseId in optionalClauses) {
      allClauses[clauseId as OptionalClauseId] = optionalClauses[clauseId as OptionalClauseId];
    }
  }

  /**
   * STEP 3: Ordering
   * Loop through the master structure and pick the text from our collection.
   * This ensures Clause 1 always comes before Clause 2.
   */
  const orderedClauseTexts: string[] = [];

  for (const clauseId of contractStructure) {
    const clauseText = allClauses[clauseId];
    if (clauseText) {
      orderedClauseTexts.push(clauseText);
    }
  }

  /**
   * STEP 4: Assembly
   * Join sections with double newlines for a clean legal layout.
   */
  let contractText = orderedClauseTexts.join("\n\n");

  /**
   * STEP 5: Placeholder Replacement
   * We replace tokens like {{PARTY_A_NAME}} with the actual value.
   */
  const signatureFields = ["PARTY_A_SIGNATURE", "PARTY_B_SIGNATURE"];
  
  for (const key in placeholderValues) {
    const value = placeholderValues[key as PlaceholderKey];
    
    // We only replace if there is actually a value (even an empty string)
    if (value !== undefined) {
      const placeholderToken = `{{${key}}}`;
      // Split/Join is faster and safer for global replacement in large strings
      contractText = contractText.split(placeholderToken).join(String(value));
    }
  }

  // Handle signature defaults if not explicitly provided
  for (const key of signatureFields) {
    if (!placeholderValues[key as PlaceholderKey]) {
      const placeholderToken = `{{${key}}}`;
      contractText = contractText.split(placeholderToken).join("_______________________");
    }
  }

  /**
   * STEP 6: Fallback for missing data
   * If any {{KEYS}} remain (because they weren't in the placeholderValues),
   * we highlight them so the user/admin knows the document is incomplete.
   */
  contractText = contractText.replace(/\{\{([^}]+)\}\}/g, "[MISSING: $1]");

  return contractText.trim();
}

/**
 * Utility to find every placeholder mentioned in the text of a specific 
 * selection of clauses. Used to generate form fields dynamically.
 */
export function getUsedPlaceholders(
  selectedOptionalClauses: string[] = []
): PlaceholderKey[] {
  const placeholderPattern = /\{\{([^}]+)\}\}/g;
  const foundPlaceholders = new Set<PlaceholderKey>();

  // Scan Core
  for (const key in coreClauses) {
    const text = coreClauses[key as CoreClauseId];
    for (const match of text.matchAll(placeholderPattern)) {
      foundPlaceholders.add(match[1] as PlaceholderKey);
    }
  }

  // Scan Selected Optional
  for (const clauseId of selectedOptionalClauses) {
    if (clauseId in optionalClauses) {
      const text = optionalClauses[clauseId as OptionalClauseId];
      for (const match of text.matchAll(placeholderPattern)) {
        foundPlaceholders.add(match[1] as PlaceholderKey);
      }
    }
  }

  return Array.from(foundPlaceholders);
}