import { connectDB } from "../lib/db";
import Contract from "../db/models/Contract";

async function cleanup() {
  try {
    await connectDB();
    
    console.log("Searching for terminated contracts...");
    const result = await Contract.deleteMany({
      contractStatus: "terminated"
    });

    console.log(`Deleted ${result.deletedCount} terminated contracts.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanup();
