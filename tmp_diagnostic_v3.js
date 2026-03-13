
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

const targetContractId = 'bfde7cc1-1c9e-436f-868d-df58c9978cc6';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Contract = mongoose.models.Contract || mongoose.model('Contract', new mongoose.Schema({}, { strict: false }), 'contracts');
  const contract = await Contract.findOne({ contractId: targetContractId }).lean();
  
  let output = "--- DB DIAGNOSTIC ---\n";
  if (!contract) {
    output += `ERROR: Contract not found by contractId: ${targetContractId}\n`;
  } else {
    output += "CONTRACT DATA:\n";
    output += `  _id:            ${contract._id}\n`;
    output += `  contractId:     ${contract.contractId}\n`;
    output += `  ownerId:        ${contract.ownerId}\n`;
    output += `  partyB_Email:   |${contract.partyB_Email}|\n`;
    output += `  partyB_ClerkId: ${JSON.stringify(contract.partyB_ClerkId)}\n`;
    output += `  status:         ${contract.contractStatus}\n`;
  }

  fs.writeFileSync('tmp_diag_result.txt', output);
  await mongoose.disconnect();
}

run().catch(console.error);
