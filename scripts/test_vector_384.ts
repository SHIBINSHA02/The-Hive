import "dotenv/config";
import mongoose from "mongoose";
import Contract from "../db/models/Contract";

async function testVector384() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const queryVector = new Array(384).fill(0.1);
  console.log("Testing with vector length:", queryVector.length);

  try {
    const docs = await Contract.aggregate([
      {
        $vectorSearch: {
          index: "hive_index",
          path: "embeddings",
          queryVector: queryVector,
          numCandidates: 100,
          limit: 3,
        },
      },
    ]);
    console.log("Vector search successful! Results:", docs.length);
  } catch (err: any) {
    console.error("Vector Search Failed!");
    console.error(err.message);
  }

  process.exit(0);
}

testVector384().catch(console.error);
