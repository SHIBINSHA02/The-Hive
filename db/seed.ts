// db/seed.ts
import mongoose from "mongoose";
import ClientProfile from "./models/ClientProfile.ts";
import ContractProfile from "./models/ContractProfile.ts";
import Contract from "./models/Contract.ts";
import Financial from "./models/Finance.ts";
import Conversation from "./models/Conversation.ts";

import 'dotenv/config';


const MONGO_URI =
  process.env.MONGODB_URI;

const USERS = [
  new mongoose.Types.ObjectId("694df4e38653e5d62effe7ba"),
  new mongoose.Types.ObjectId("695a98d28653e5d62e001def"),
  new mongoose.Types.ObjectId("695a99468653e5d62e001df0"),
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🔥 Connected to MongoDB");

    await ClientProfile.deleteMany({});
    await ContractProfile.deleteMany({});
    await Contract.deleteMany({});
    await Financial.deleteMany({});
    await Conversation.deleteMany({});
    console.log("🧹 Old Data Cleared");

    // ------------------------------
    // 1️⃣ PROFILES
    // ------------------------------
    const clientProfiles = [];
    const contractorProfiles = [];

    for (const user of USERS) {
      const client = await ClientProfile.create({
        user,
        name: `Client Profile ${user.toString().slice(-4)}`
      });

      const contractor = await ContractProfile.create({
        user,
        name: `Contractor Profile ${user.toString().slice(-4)}`
      });

      clientProfiles.push(client);
      contractorProfiles.push(contractor);
    }

    console.log("👤 Profiles Created");

    // ------------------------------
    // 2️⃣ CONTRACTS
    // ------------------------------
   // ------------------------------
// 2️⃣ CONTRACTS
// ------------------------------
const contracts = [];

for (let i = 0; i < 10; i++) {
  const client = clientProfiles[i % clientProfiles.length];
  const contractor =
    contractorProfiles[(i + 1) % contractorProfiles.length];

  const title = `Project ${i + 1}`;
  const company = `Company ${i + 1}`;

  const summary = `
This contract establishes a formal agreement between ${company} and the assigned contractor 
for execution of ${title}. The project includes structured milestones, financial terms,
defined responsibilities, and delivery deadlines. Both parties agree to collaborate to ensure
on-time delivery while maintaining quality and compliance standards.
  `.trim();

  const contractContent = `
# ${title} — Official Contract

**Company:** ${company}  
**Client Profile:** ${client.name}  
**Contractor Profile:** ${contractor.name}  
**Start Date:** ${new Date().toDateString()}  

---

## 1. Introduction
This Agreement is made between ${company} ("Client") and the assigned Contractor ("Service Provider").
Both parties acknowledge this document as a legally binding contract.

---

## 2. Work Scope
- The contractor agrees to complete ${title}.
- All deliverables must meet quality expectations.
- Changes to scope require mutual written approval.

---

## 3. Responsibilities
### Client Responsibilities:
- Provide clear requirements
- Provide necessary access/resources
- Release payments per milestone schedule

### Contractor Responsibilities:
- Deliver agreed work
- Maintain communication
- Meet deadlines

---

## 4. Milestones & Deadlines
Phase 1:
- Description: Initial implementation
- Status: Paid

Phase 2:
- Description: Final delivery
- Status: Pending

---

## 5. Financial Terms
- Payments linked to milestone completion
- Currency: INR
- Late payments may delay delivery

---

## 6. Termination
Either party may terminate the agreement with proper notice.
Work completed up to termination must be compensated.

---

## 7. Legal
Both parties agree to comply with all applicable local and international legal frameworks.

---

Signed electronically by both parties.
  `.trim();

  const contract = await Contract.create({
    contractId: `CON-${1000 + i}`,
    contractTitle: title,
    companyName: company,
    startDate: new Date(),
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    progress: Math.floor(Math.random() * 100),
    client: client._id,
    contractor: contractor._id,
    contractStatus: ["pending", "active", "completed"][i % 3],
    description: `This is contract description for ${title}`,
    clauses: ["Work quality must be maintained", "Confidentiality required"],
    keypoints: ["Milestone based", "Legal binding", "Quality required"],

    // ✅ NEW FIELDS
    summary,
    contractContent
  });

  contracts.push(contract);
}

console.log("📄 Contracts Created");

 

    // ------------------------------
    // 3️⃣ FINANCE
    // ------------------------------
    for (const contract of contracts) {
      const total = Math.floor(Math.random() * 50000) + 20000;
      const paid = Math.floor(total / 2);

            await Financial.create({
        financialId: `FIN-${contract.contractId}`,
        contract: contract._id,
        client: contract.client,
        contractor: contract.contractor,
        totalAmount: total,
        paidAmount: paid,
        dueAmount: total - paid,
        currency: "INR",

        milestones: [
          {
            title: "Phase 1",
            amount: total / 2,
            dueDate: new Date(),
            isPaid: true
          },
          {
            title: "Phase 2",
            amount: total / 2,
            dueDate: new Date(Date.now() + 86400000 * 10),
            isPaid: false
          }
        ],

        // ✅ ADD THIS
        transactions: [
          {
            transactionId: `TXN-${contract.contractId}-1`,
            type: "credit",
            amount: total / 2,
            description: "Milestone 1 Payment",
            paymentMethod: "upi",
            status: "paid",
            date: new Date()
          },
          {
            transactionId: `TXN-${contract.contractId}-2`,
            type: "pending",
            amount: total / 2,
            description: "Milestone 2 Pending",
            paymentMethod: "bank_transfer",
            status: "pending",
            date: new Date(Date.now() + 86400000 * 7)
          }
        ],

        paymentStatus: paid >= total ? "completed" : "partial",
        lastPaymentDate: new Date()
      });

    }

    console.log("💰 Finance Created");

    // ------------------------------
    // 4️⃣ CONVERSATIONS
    // ------------------------------
    for (const contract of contracts) {
      await Conversation.create({
        conversationId: `CONVO-${contract.contractId}`,
        contractId: contract._id,
        participants: {
          client: contract.client,
          contractor: contract.contractor
        },
        messages: [
          {
            senderId: contract.client.toString(),
            senderRole: "client",
            message: "Hello, can we discuss project details?",
            isRead: true
          },
          {
            senderId: contract.contractor.toString(),
            senderRole: "contractor",
            message: "Sure, let's proceed.",
            isRead: true
          }
        ],
        lastMessage: "Sure, let's proceed.",
        status: "active"
      });
    }

    console.log("💬 Conversations Created");
    console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seed Failed", err);
    process.exit(1);
  }
}

seed();
