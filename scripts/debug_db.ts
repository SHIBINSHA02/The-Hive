import "dotenv/config";
import mongoose from "mongoose";
import Contract from "../db/models/Contract";

async function debug() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const contracts = await Contract.find({}).limit(5);
  console.log("Found contracts:", contracts.length);

  contracts.forEach(c => {
    console.log(`Contract: ${c.contractTitle}, Embedding Dim: ${c.embeddings?.length || 0}`);
  });

  process.exit(0);
}

debug().catch(console.error);
