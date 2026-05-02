import mongoose from "mongoose";

async function dropIndex() {
  const MONGODB_URI = "mongodb+srv://shibin24666_db_user:NdKxRb3oMzNbhV2q@cluster0.aj00unx.mongodb.net/?appName=Cluster0";
  
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const db = mongoose.connection.db;
    if (!db) throw new Error("DB not found");

    const collection = db.collection("financials");
    
    console.log("Checking indexes on 'financials'...");
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map(i => i.name));

    if (indexes.find(i => i.name === "transactions.transactionId_1")) {
      console.log("Dropping index 'transactions.transactionId_1'...");
      await collection.dropIndex("transactions.transactionId_1");
      console.log("Index dropped.");
    } else {
      console.log("Index 'transactions.transactionId_1' not found.");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

dropIndex();
