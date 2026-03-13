
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const contractId = 'bfde7cc1-1c9e-436f-868d-df58c9978cc6';
const clerkId = 'user_37niDLv732nrOZGJY0rRRTW0zId';
const userEmail = 'user_37nidlv732nrozgjy0rrrtw0zid@example.com';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const Contract = mongoose.models.Contract || mongoose.model('Contract', new mongoose.Schema({}, { strict: false }), 'contracts');
  
  const contract = await Contract.findOne({ contractId: contractId });
  
  if (!contract) {
    console.log("Contract NOT FOUND by contractId:", contractId);
    return;
  }

  console.log("Contract FOUND:");
  console.log("- ownerId:", JSON.stringify(contract.ownerId));
  console.log("- partyB_Email:", JSON.stringify(contract.partyB_Email));
  console.log("- partyB_ClerkId:", JSON.stringify(contract.partyB_ClerkId));
  console.log("- Object ID:", contract._id);
  
  const isOwner = contract.ownerId === clerkId;
  const dbEmail = contract.partyB_Email ? contract.partyB_Email.toLowerCase().trim() : "";
  const isPartyB = 
    (contract.partyB_ClerkId && contract.partyB_ClerkId === clerkId) || 
    (dbEmail && userEmail && dbEmail === userEmail);
  
  console.log("Permissions Debug:");
  console.log("- Logged in clerkId:", JSON.stringify(clerkId));
  console.log("- Logged in userEmail:", JSON.stringify(userEmail));
  console.log("- Normalized DB Email:", JSON.stringify(dbEmail));
  console.log("- Is Owner Match?", isOwner);
  console.log("- Is Party B Match?", isPartyB);

  await mongoose.disconnect();
}

run().catch(console.error);
