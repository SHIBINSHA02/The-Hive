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
 *
 * @param apiKey - Your Gemini API key from Google AI Studio
 * @returns AIClient instance ready to generate text
 * @throws Error if API key is missing or invalid
 */
export function createGeminiClient(apiKey: string): AIClient {
  /**
   * Fail fast if API key is missing.
   */
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable. " +
      "Please set it in your .env file or environment configuration."
    );
  }

  // Initialize the Google Generative AI SDK
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use gemini-1.5-pro for high quality legal text refinement
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    }
  });

  // Return AIClient interface implementation
  return {
    generateText: async (prompt: string): Promise<string> => {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Gemini AI API error: ${message}`);
      }
    },
  };
}
