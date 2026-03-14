/**
 * recompute_embeddings.ts
 * One-time script to re-embed all contracts using the new MiniLM-L6-v2 model.
 */

import "dotenv/config";
import mongoose from "mongoose";
import Contract from "../db/models/Contract";
import { customAIClient } from "../lib/customAIClient";

const MONGO_URI = process.env.MONGODB_URI;

/**
 * UTILITY: Generate Embedding Text (Mirrors Contract.ts logic)
 */
const getEmbedText = (doc: any) => {
  return `
    Title: ${doc.contractTitle}
    Company: ${doc.companyName}
    Summary: ${doc.summary || ""}
    Keypoints: ${doc.keypoints?.join(", ") || ""}
    Content: ${doc.contractContent || ""}
  `.trim();
};

async function migrate() {
  if (!MONGO_URI) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("🔥 Connected to MongoDB");

    const contracts = await Contract.find({});
    console.log(`🔍 Found ${contracts.length} contracts to re-embed.`);

    for (let i = 0; i < contracts.length; i++) {
        const contract = contracts[i];
        console.log(`[${i + 1}/${contracts.length}] Processing: ${contract.contractTitle}`);

        try {
            const textToEmbed = getEmbedText(contract);
            const newEmbedding = await customAIClient.getEmbedding(textToEmbed);
            
            // bypass middleware to avoid infinite loop or extra calls
            await Contract.updateOne(
                { _id: contract._id },
                { $set: { embeddings: newEmbedding } }
            );

            console.log(`✅ Updated embeddings (dim: ${newEmbedding.length})`);
        } catch (err) {
            console.error(`❌ Failed to embed contract ${contract._id}:`, err);
        }
    }

    console.log("🎉 Re-embedding complete!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
