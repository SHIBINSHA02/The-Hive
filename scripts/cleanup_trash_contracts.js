const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("../lib/db");
const Contract = require("../db/models/Contract").default || require("../db/models/Contract");

async function cleanup() {
  try {
    await connectDB();
    
    // Deleting all terminated contracts as requested
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
