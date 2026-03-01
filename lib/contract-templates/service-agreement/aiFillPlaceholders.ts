/**
 * aiFillPlaceholders.ts
 * ----------------------------
 * This file is responsible for AI-powered placeholder refinement.
 *
 * IMPORTANT RULES:
 * 1. AI can ONLY refine values that the user already provided
 * 2. AI MUST NOT generate content for empty fields
 * 3. Currently supports single-field refinement (live buttons)
 *
 * Example Use Case:
 * - Single field: User types "web design" → clicks refine → "Professional web design services"
 *
 * Empty field handling:
 * - User input: "" (empty)
 * - AI: Does nothing, returns empty object
 */

import { PlaceholderKey, PlaceholderValueMap } from "./placeholders";
import { placeholderAIPermissions } from "./aiPermissions";

/**
 * Generic AI client interface.
 * Allows swapping between Gemini, OpenAI, Claude, etc.
 */
export type AIClient = {
  generateText: (prompt: string) => Promise<string>;
};

/**
 * Helper: Safely parse JSON from AI response.
 * Strips markdown code blocks if AI includes them.
 *
 * @param raw - Raw AI response string
 * @returns Parsed JSON object or null if parsing fails
 */
function safeJsonParse(raw: string): any {
  try {
    // Remove markdown code blocks like ```json ... ```
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * Helper: Build AI prompt for refining a single field.
 * Used when user clicks "Refine" button on individual field.
 *
 * This provides focused, faster refinement.
 *
 * @param key - Placeholder key to refine
 * @param userValues - All user values (for context)
 * @returns Formatted prompt string
 */
function buildSingleFieldPrompt(
  key: PlaceholderKey,
  userValues: Partial<PlaceholderValueMap>
): string {
  return `
You are a legal contract writing assistant.

Your task: Refine the user's casual input into professional contract language.

Field name: ${key}
User's input: "${userValues[key]}"

Rules:
- Keep the core meaning and intent intact
- Make it professional, clear, and legally appropriate
- Be concise but complete
- Use formal contract language
- Return ONLY valid JSON
- No markdown code blocks
- No explanations or comments
- NEVER return an empty string - always provide meaningful refined text
- Do NOT add new information not present in the user's input

Return JSON format:
{
  "${key}": "your refined professional text here"
}
`.trim();
}

/**
 * MULTI-FIELD REFINEMENT (Currently not in use)
 * 
 * Uncomment this if you want to add a "Refine All Fields" button in the future.
 */

/*
function buildMultiFieldPrompt(
  keys: PlaceholderKey[],
  userValues: Partial<PlaceholderValueMap>
): string {
  return `
You are a legal contract writing assistant.

Your task: Refine multiple user inputs into professional contract language.

STRICT RULES:
- Only refine the fields that have user-provided values
- Do NOT generate content for missing or empty fields
- Keep output professional, clear, and contract-appropriate
- Maintain consistency across all fields
- Return ONLY valid JSON
- No markdown code blocks
- No explanations
- NEVER return empty strings - always provide meaningful refined text

User provided values:
${JSON.stringify(userValues, null, 2)}

Fields to refine:
${JSON.stringify(keys, null, 2)}

Return JSON format:
{
  "FIELD_NAME": "refined professional text",
  "ANOTHER_FIELD": "refined professional text"
}
`.trim();
}
*/

/**
 * Main Function: AI-powered placeholder refinement
 *
 * Takes user-provided values and refines them into professional contract language.
 * Currently supports single-field refinement (individual "Refine" buttons).
 *
 * Process:
 * 1. Filter to only AI-allowed keys (with safety check)
 * 2. Filter to only keys with actual user input (NOT empty)
 * 3. Build prompt for single field
 * 4. Call AI client
 * 5. Parse and validate response
 * 6. Return refined values (excluding empty AI responses)
 *
 * @param aiClient - AI client instance (Gemini/OpenAI/Claude)
 * @param input - Configuration object
 * @param input.userValues - Partial placeholder values from user
 * @param input.keysToRefine - Which keys to refine (typically single field)
 * @returns Refined placeholder values (only for keys that were refined)
 *
 * @example
 * // Single field refinement (live button)
 * const refined = await aiFillPlaceholders(geminiClient, {
 *   userValues: { SERVICE_DESCRIPTION: "web design" },
 *   keysToRefine: ['SERVICE_DESCRIPTION']
 * });
 * // Returns: { SERVICE_DESCRIPTION: "Professional web design and UI/UX services" }
 */
export async function aiFillPlaceholders(
  aiClient: AIClient,
  input: {
    userValues: Partial<PlaceholderValueMap>;
    keysToRefine: PlaceholderKey[];
  }
): Promise<Partial<PlaceholderValueMap>> {
  const { userValues, keysToRefine } = input;

  /**
   * Step 1: Filter only AI-allowed keys
   *
   * SAFETY: Use optional chaining (?.) to prevent crashes if a key
   * doesn't exist in placeholderAIPermissions.
   * 
   * This can happen if:
   * - New placeholder added to placeholders.ts but not to aiPermissions.ts
   * - Typo in placeholder key
   * - Data inconsistency
   */
  const allowedKeys = keysToRefine.filter(
    (key) => placeholderAIPermissions[key]?.allowAI === true
  );

  /**
   * Step 2: Filter only keys where user provided input
   *
   * CRITICAL: AI MUST NOT generate content for empty fields.
   * This enforces the rule that AI only refines, never invents.
   */
  const keysWithUserInput = allowedKeys.filter((key) => {
    const value = userValues[key];
    
    // Reject undefined or null
    if (value === undefined || value === null) return false;
    
    // Reject empty strings or whitespace-only strings
    if (typeof value === "string" && value.trim() === "") return false;
    
    return true;
  });

  /**
   * If no valid keys to refine, return empty object.
   * This happens when:
   * - All requested keys are user-required (not AI-allowed)
   * - All requested keys have empty values
   * - Keys don't exist in aiPermissions
   */
  if (keysWithUserInput.length === 0) {
    return {};
  }

  /**
   * Step 3: Build AI prompt
   *
   * Currently only supports single field refinement.
   */
  const isSingleField = keysWithUserInput.length === 1;

  // For now, we only support single field refinement
  if (!isSingleField) {
    throw new Error("Multi-field refinement not currently supported. Refine fields individually.");
  }

  const prompt = buildSingleFieldPrompt(keysWithUserInput[0], userValues);

  /**
   * Multi-field support (commented out - uncomment if needed):
   */
  /*
  const prompt = isSingleField
    ? buildSingleFieldPrompt(keysWithUserInput[0], userValues)
    : buildMultiFieldPrompt(keysWithUserInput, userValues);
  */

  /**
   * Step 4: Call AI client
   *
   * This makes the actual API call to Gemini/OpenAI/Claude.
   * The aiClient handles authentication and API communication.
   */
  const aiResponse = await aiClient.generateText(prompt);

  /**
   * Step 5: Parse AI response
   *
   * Expected format: { "FIELD_NAME": "refined text", ... }
   * If AI returns invalid JSON, throw error.
   */
  const parsed = safeJsonParse(aiResponse);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI returned invalid JSON for placeholder refinement.");
  }

  /**
   * Step 6: Build result object (safety enforcement)
   *
   * Only include keys that:
   * 1. Were requested to be refined
   * 2. Have valid values in AI response
   * 3. AI response is NOT an empty string
   *
   * This prevents:
   * - AI from returning unexpected fields
   * - Empty AI responses from overwriting user input
   */
  const result: Partial<PlaceholderValueMap> = {};

  for (const key of keysWithUserInput) {
    const aiValue = parsed[key];

    // Skip if AI didn't return this key
    if (aiValue === undefined || aiValue === null) {
      continue;
    }

    // SAFETY CHECK: Skip if AI returned empty string
    // This prevents overwriting user's input with nothing
    if (typeof aiValue === "string" && aiValue.trim() === "") {
      console.warn(`AI returned empty string for ${key}, keeping original value`);
      continue;
    }

    // Valid refined value - include it
    result[key] = String(aiValue);
  }

  return result;
}