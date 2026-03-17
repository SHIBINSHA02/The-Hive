/**
 * customAiClient.ts
 * ---------------
 * Custom AI client implementation for AI placeholder refinement.
 *
 * This file wraps the deployed AI endpoint and adapts it to the
 * AIClient interface used by aiFillPlaceholders.ts
 *
 * Endpoint from env variable: CUSTOM_MODEL_ENDPOINT
 */

import { AIClient } from "./aiFillPlaceholders";

export function createCustomAIClient(): AIClient {
  const modelEndpoint = process.env.CUSTOM_MODEL_ENDPOINT;

  if (!modelEndpoint) {
    throw new Error(
      "Missing CUSTOM_MODEL_ENDPOINT environment variable. " +
      "Please set it in your .env file."
    );
  }

  return {
    /**
     * Generate text using the deployed custom model
     *
     * @param prompt - Text prompt to send to the model
     * @returns Generated text response
     * @throws Error if API call fails
     */
    generateText: async (prompt: string): Promise<string> => {
      try {
        const response = await fetch(modelEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt,
            max_new_tokens: 1000, // Increased to prevent truncation for long legal clauses
            temperature: 0.3,   // Professional, consistent
            top_p: 0.8
          }),
        });

        if (!response.ok) {
          throw new Error(`Custom AI API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.generated_text;
      } catch (error) {
        const message = error instanceof Error 
          ? error.message 
          : String(error);

        throw new Error(`Custom AI Client error: ${message}`);
      }
    },
  };
}
