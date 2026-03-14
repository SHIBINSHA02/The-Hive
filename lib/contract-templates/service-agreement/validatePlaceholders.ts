// validatePlaceholders.ts

import { contractPlaceholders, PlaceholderKey, PlaceholderType } from "./placeholders";

/**
 * validatePlaceholders.ts
 * -----------------------
 * This file validates the placeholder input object provided by the user (or AI).
 *
 * What it does:
 * 1) Checks if all REQUIRED placeholders are present.
 * 2) Validates that each placeholder value matches its expected datatype.
 * 3) Returns a detailed validation report (missing fields + datatype errors).
 *
 * Why this is needed:
 * - Prevents generating incomplete contracts.
 * - Ensures correct formatting (dates are valid, text fields are strings, etc.).
 * - Makes debugging easier by returning clear validation errors.
 *
 * Example:
 * If PARTY_A_NAME is required but missing, it will return it under missingRequired.
 * If EFFECTIVE_DATE is expected to be "date" but user gives "hello", it will return a datatype error.
 */

export type PlaceholderValidationError = {
  key: PlaceholderKey;
  expectedType: PlaceholderType;
  receivedValue: unknown;
  message: string;
};

export type PlaceholderValidationResult = {
  isValid: boolean;
  missingRequired: PlaceholderKey[];
  datatypeErrors: PlaceholderValidationError[];
};

/**
 * Helper: Validates if a value is a valid date string.
 * Accepts formats like:
 * - "2026-02-12"
 * - "12-02-2026" (not recommended but can be allowed later)
 */
function isValidDate(value: string): boolean {
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

/**
 * Helper: Checks if a value matches the required type.
 */
function validateType(type: PlaceholderType, value: unknown): boolean {
  if (type === "string" || type === "text") {
    return typeof value === "string" && value.trim().length > 0;
  }

  if (type === "date") {
    return typeof value === "string" && isValidDate(value);
  }

  if (type === "image") {
    return typeof value === "string" && value.startsWith("data:image/");
  }

  return false;
}

/**
 * Main Validator:
 * Validates required placeholders + datatype correctness.
 */
export function validatePlaceholders(
  input: Partial<Record<PlaceholderKey, unknown>>
): PlaceholderValidationResult {
  const missingRequired: PlaceholderKey[] = [];
  const datatypeErrors: PlaceholderValidationError[] = [];

  for (const key in contractPlaceholders) {
    const placeholderKey = key as PlaceholderKey;
    const { type, required } = contractPlaceholders[placeholderKey];

    const value = input[placeholderKey];

    // Check missing required fields
    if (required && (value === undefined || value === null || value === "")) {
      missingRequired.push(placeholderKey);
      continue;
    }

    // If value exists, validate datatype
    if (value !== undefined && value !== null && value !== "") {
      const valid = validateType(type, value);

      if (!valid) {
        datatypeErrors.push({
          key: placeholderKey,
          expectedType: type,
          receivedValue: value,
          message: `Invalid datatype for ${placeholderKey}. Expected ${type}.`,
        });
      }
    }
  }

  return {
    isValid: missingRequired.length === 0 && datatypeErrors.length === 0,
    missingRequired,
    datatypeErrors,
  };
}
