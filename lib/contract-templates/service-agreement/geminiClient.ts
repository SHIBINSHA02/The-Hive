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

import { GoogleGenerativeAI } from "@google/generative-ai";
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

  // Initialize Gemini with API key
  const genAI = new GoogleGenerativeAI(apiKey);

  // Configure the model
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Best model for professional writing

    generationConfig: {
      /**
       * Temperature controls randomness/creativity:
       * - 0.0 = Always picks most likely word (very consistent)
       * - 0.3 = Mostly consistent with slight variation (good for contracts)
       * - 0.7 = Balanced creativity
       * - 1.0 = Very creative and random
       *
       * For legal contracts: Use 0.3 for professional consistency
       */
      temperature: 0.3,

      /**
       * topP: Nucleus sampling (0.0 to 1.0)
       * Controls diversity of word selection
       */
      topP: 0.8,

      /**
       * topK: Limits number of token choices
       * Smaller = more focused, larger = more diverse
       */
      topK: 40,
    },
  });

  // Return AIClient interface implementation
  return {
    /**
     * Generate text using Gemini
     *
     * @param prompt - Text prompt to send to Gemini
     * @returns Generated text response
     * @throws Error if Gemini API call fails
     */
    generateText: async (prompt: string): Promise<string> => {
      try {
        // Send prompt to Gemini
        const result = await model.generateContent(prompt);

        // Extract response
        const response = await result.response;

        // Return text content
        return response.text();
      } catch (error) {
        /**
            * Normalize error output.
            * Gemini SDK may throw non-standard error shapes.
        */

        const message = error instanceof Error 
          ? error.message 
          : String(error);

        throw new Error(`Gemini API error: ${message}`);
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