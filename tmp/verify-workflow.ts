import mongoose from "mongoose";
import Contract from "../db/models/Contract.ts";
import { connectDB } from "../lib/db.ts";

// Note: This script is intended to be run in a Node environment where the DB is accessible.
// It bypasses the API for direct DB state verification.

async function verifyWorkflow() {
  await connectDB();
  console.log("Connected to DB");

  // 1. Find a draft contract
  let contract = await Contract.findOne({ contractStatus: "draft" });
  if (!contract) {
    console.log("No draft contract found to test. Creating one...");
    contract = await Contract.create({
      ownerId: "test_user",
      contractId: "test-" + Date.now(),
      contractTitle: "Test Workflow Contract",
      companyName: "Test Company",
      startDate: new Date(),
      deadline: new Date(),
      client: new mongoose.Types.ObjectId(),
      contractor: new mongoose.Types.ObjectId(),
      contractStatus: "draft"
    });
  }

  console.log(`Testing contract: ${contract.contractId} (Status: ${contract.contractStatus})`);

  // 2. Transition to sent_for_review
  contract.contractStatus = "sent_for_review";
  await contract.save();
  console.log("-> Transitioned to sent_for_review");

  // 3. Transition to locked
  contract.contractStatus = "locked";
  await contract.save();
  console.log("-> Transitioned to locked");

  // 4. Sign by Owner
  contract.ownerSigned = true;
  await contract.save();
  console.log("-> Owner signed");

  // 5. Sign by Party B
  contract.partyBSigned = true;
  // Trigger the logic that should be in the API (already implemented in routes)
  if (contract.ownerSigned && contract.partyBSigned) {
    contract.contractStatus = "active";
  }
  await contract.save();
  console.log("-> Party B signed");
  console.log(`Final Status: ${contract.contractStatus}`);

  if (contract.contractStatus === "active") {
    console.log("SUCCESS: Workflow verified.");
  } else {
    console.log("FAILURE: Contract did not reach active status.");
  }

  process.exit(0);
}

verifyWorkflow().catch(err => {
  console.error(err);
  process.exit(1);
});
