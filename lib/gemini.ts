import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");


export async function getGeminiEmbedding(text: string): Promise<number[]> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Skipping embedding generation.");
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    // gemini-embedding-001 outputs 3072 dimensions by default - matches the Atlas index
    const result = await model.embedContent(text);

    let embedding = result.embedding.values;

    // Normalize to unit vector (improves cosine similarity)
    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      embedding = embedding.map(v => v / norm);
    }

    return embedding;
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    // Return empty array instead of throwing to prevent save failures if the hook was strict
    return [];
  }
}

/**
 * Generates a conversational response using Gemini.
 * Model: gemini-2.0-flash (User requested 2.5, using 2.0 as the latest available)
 */
export async function geminiChat(prompt: string, context: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const fullPrompt = `
You are Hive AI, a professional legal contract assistant.
Use the following contract context to answer the user's question.
If the answer is not in the context, be honest and say so.

CONTEXT:
${context}

USER QUESTION:
${prompt}

ANSWER:
`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
}
