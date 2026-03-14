/**
 * test_custom_ai.ts
 * Simple verification script for the custom AI client.
 */

import "dotenv/config";
import { customAIClient } from "../lib/customAIClient";

async function test() {
  console.log("Testing Custom AI Client...");

  try {
    console.log("\n1. Testing Embedding Endpoint...");
    const embedding = await customAIClient.getEmbedding("Hello from The Hive!");
    console.log("✅ Embedding length:", embedding.length);
    if (embedding.length === 384) {
      console.log("✅ Dimension match (384)");
    } else {
      console.warn("⚠️ Unexpected dimension:", embedding.length);
    }

    console.log("\n2. Testing Generation Endpoint...");
    const response = await customAIClient.generateText("Explain the purpose of a confidentiality clause in 2 sentences.", {
        temperature: 0.1,
        max_new_tokens: 100
    });
    console.log("✅ Generated Text:", response.trim());

    console.log("\nTests completed successfully!");
  } catch (err) {
    console.error("\n❌ Test Failed:", err);
  }
}

test();
