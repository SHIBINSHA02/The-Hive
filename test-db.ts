import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB");
  const db = mongoose.connection.db;
  
  if (!db) {
      console.log("No db connection");
      return;
  }
  
  // Find a contract that is active
  const contracts = await db.collection('contracts').find({ contractStatus: 'active' }).toArray();
  console.log("Active contracts:", contracts.length);
  if (contracts.length > 0) {
      console.log("Fields in first active contract:");
      console.log("- ownerRequestedTermination:", contracts[0].ownerRequestedTermination);
      console.log("- partyBRequestedTermination:", contracts[0].partyBRequestedTermination);
  } else {
      const allContracts = await db.collection('contracts').find().limit(1).toArray();
      console.log("Any contract:", allContracts[0]?.contractStatus);
      console.log("- ownerRequested:", allContracts[0]?.ownerRequestedTermination);
      console.log("- partyBRequested:", allContracts[0]?.partyBRequestedTermination);
  }
  process.exit(0);
}
check();
