import mongoose from "mongoose";

async function deleteDraft() {
  const MONGODB_URI = "mongodb+srv://shibin24666_db_user:NdKxRb3oMzNbhV2q@cluster0.aj00unx.mongodb.net/?appName=Cluster0";
  const draftId = "69f5e09850371f485c710902";
  
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const db = mongoose.connection.db;
    if (!db) throw new Error("DB not found");

    // Try to find it in Contracts collection
    const Contract = mongoose.connection.collection("contracts");
    const result = await Contract.deleteOne({ _id: new mongoose.Types.ObjectId(draftId) });
    
    if (result.deletedCount > 0) {
      console.log(`Successfully deleted contract ${draftId}`);
    } else {
      // Try by contractId string if _id didn't work
      const result2 = await Contract.deleteOne({ contractId: draftId });
      if (result2.deletedCount > 0) {
        console.log(`Successfully deleted contract by contractId ${draftId}`);
      } else {
        console.log(`Contract ${draftId} not found.`);
      }
    }

    // Also delete associated financials
    const Financial = mongoose.connection.collection("financials");
    const finResult = await Financial.deleteMany({ contract: new mongoose.Types.ObjectId(draftId) });
    console.log(`Deleted ${finResult.deletedCount} associated financial records.`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

deleteDraft();
