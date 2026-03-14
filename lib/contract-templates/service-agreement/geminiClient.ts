/**
 * geminiClient.ts
 * ---------------
 * Gemini API client implementation for AI placeholder refinement.
 *
 * This file wraps the Google Generative AI SDK and adapts it to the
 * AIClient interface used by aiFillPlaceholders.ts
 *
 * Setup:
 * 1. Install: npm install @google/generative-ai
 * 2. Set environment variable: GEMINI_API_KEY=your_key_here
 * 3. Import and create client in your API endpoint
 *
 * Why separate file?
 * - Easy to swap AI providers (Gemini → Claude → OpenAI)
 * - Keeps API implementation details isolated
 * - Can mock for testing
 */

import { customAIClient } from "../../customAIClient";
import { AIClient } from "./aiFillPlaceholders";

/**
 * Creates a Gemini AI client that implements the AIClient interface.
 *
 * Configuration:
 * - Model: gemini-1.5-pro (best quality for contract writing)
 * - Temperature: 0.3 (consistent, professional output)
 * - topP/topK: Standard values for focused generation
 *
 * @param apiKey - Your Gemini API key from Google AI Studio
 * @returns AIClient instance ready to generate text
 * @throws Error if API key is missing or invalid
 *
 * @example
 * const client = createGeminiClient(process.env.GEMINI_API_KEY!);
 * const response = await client.generateText("Refine this: web design");
 */
export function createGeminiClient(apiKey: string): AIClient {
  /**
 * Fail fast if API key is missing.
 * Prevents confusing runtime errors later.
 */

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable. " +
      "Please set it in your .env file or environment configuration."
    );
  }

  // Return AIClient interface implementation
  return {
    generateText: async (prompt: string): Promise<string> => {
      try {
        return await customAIClient.generateText(prompt, {
          temperature: 0.3,
          max_new_tokens: 1024
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Custom AI API error: ${message}`);
      }
    },
  };
}

/**
 * Usage Example:
 *
 * // In your API endpoint:
 * import { createGeminiClient } from '@/lib/geminiClient';
 * import { aiFillPlaceholders } from '@/lib/aiFillPlaceholders';
 *
 * // This will throw clear error if GEMINI_API_KEY is missing
 * const geminiClient = createGeminiClient(process.env.GEMINI_API_KEY!);
 *
 * const refined = await aiFillPlaceholders(geminiClient, {
 *   userValues: { SERVICE_DESCRIPTION: "web design" },
 *   keysToRefine: ['SERVICE_DESCRIPTION']
 * });
 *
 * console.log(refined);
 * // { SERVICE_DESCRIPTION: "Professional web design and UI/UX services..." }
 */