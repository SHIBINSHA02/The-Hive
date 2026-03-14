/**
 * customAIClient.ts
 * Centralized utility for communicating with the custom AI model.
 */

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
}

export interface GenerationResponse {
  generated_text: string;
  generation_time: number;
}

const GENERATE_URL = process.env.CUSTOM_MODEL_ENDPOINT || "http://api.thehive.plannow.in:8000/generate";
const EMBED_URL = process.env.CUSTOM_EMBEDDING_ENDPOINT || "http://api.thehive.plannow.in:8000/embeddings";

export const customAIClient = {
  /**
   * Generates embeddings for the given text.
   * Model: sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(EMBED_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API failed: ${response.statusText}`);
      }

      const data: EmbeddingResponse = await response.json();
      return data.embedding;
    } catch (error) {
      console.error("Custom AI Embedding Error:", error);
      throw error;
    }
  },

  /**
   * Generates text response for the given prompt.
   * Model: shibinsha02/contract-lora (Llama 3-8B based)
   */
  async generateText(prompt: string, options: { max_new_tokens?: number; temperature?: number } = {}): Promise<string> {
    try {
      const response = await fetch(GENERATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          max_new_tokens: options.max_new_tokens || 512,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation API failed: ${response.statusText}`);
      }

      const data: GenerationResponse = await response.json();
      return data.generated_text;
    } catch (error) {
      console.error("Custom AI Generation Error:", error);
      throw error;
    }
  }
};
