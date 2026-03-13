
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const targetContractId = 'bfde7cc1-1c9e-436f-868d-df58c9978cc6';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("--- DB DIAGNOSTIC ---");

  const Contract = mongoose.models.Contract || mongoose.model('Contract', new mongoose.Schema({}, { strict: false }), 'contracts');
  
  const contract = await Contract.findOne({ contractId: targetContractId }).lean();
  
  if (!contract) {
    console.log("ERROR: Contract not found by contractId:", targetContractId);
  } else {
    console.log("CONTRACT DATA:");
    console.log("  _id:           ", contract._id);
    console.log("  contractId:    ", contract.contractId);
    console.log("  ownerId:       ", contract.ownerId);
    console.log("  partyB_Email:  ", JSON.stringify(contract.partyB_Email));
    console.log("  partyB_ClerkId:", JSON.stringify(contract.partyB_ClerkId));
    console.log("  status:        ", contract.contractStatus);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
