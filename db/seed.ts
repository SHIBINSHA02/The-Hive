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
// 2️⃣ CONTRACTS (REALISTIC DATA)
// ------------------------------
const contracts = [];

const REAL_CONTRACTS = [
  {
    title: "Enterprise Software License Agreement",
    company: "Apple Inc.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    bg: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",
    description:
      "Annual enterprise software licensing including maintenance, feature updates, and premium technical assistance."
  },
  {
    title: "Cloud Infrastructure Partnership",
    company: "Google LLC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
    bg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
    description:
      "Strategic collaboration for deployment of scalable cloud infrastructure across global environments."
  },
  {
    title: "Security Compliance Audit",
    company: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    bg: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop",
    description:
      "End-to-end cybersecurity assessment, risk evaluation, and compliance certification."
  },
  {
    title: "Supply Chain Integration",
    company: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    bg: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop",
    description:
      "Integration of intelligent logistics and real-time shipment tracking capabilities."
  },
  {
    title: "Sustainable Energy Contract",
    company: "Tesla",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Tesla_T_symbol.svg",
    bg: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop",
    description:
      "Multi-year agreement for renewable energy infrastructure and EV fleet support."
  }
];

for (let i = 0; i < 10; i++) {
  const base = REAL_CONTRACTS[i % REAL_CONTRACTS.length];

  const client = clientProfiles[i % clientProfiles.length];
  const contractor = contractorProfiles[(i + 1) % contractorProfiles.length];

  const summary = `
This contract establishes an official agreement between ${base.company} and the contractor
for execution of "${base.title}". The agreement defines responsibilities, milestones,
financial commitments, and delivery expectations.
  `.trim();

  const content = `
# ${base.title}

**Company:** ${base.company}  
**Client Profile:** ${client.name}  
**Contractor Profile:** ${contractor.name}  
**Start Date:** ${new Date().toDateString()}  

---

## Scope
The contractor agrees to successfully execute the contract deliverables while maintaining quality
and ensuring timely communication.

## Financial Terms
The payment structure is milestone-based with clear auditing and review checkpoints.

## Responsibilities
Both parties agree to mutual professionalism, confidentiality, and compliance with legal standards.

Signed electronically.
  `.trim();

  const contract = await Contract.create({
    contractId: `CON-${1000 + i}`,
    contractTitle: base.title,
    companyName: base.company,
    companyLogoUrl: base.logo,
    bgImageUrl: base.bg,
    description: base.description,

    startDate: new Date(),
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (60 + i * 10)),
    progress: Math.floor(Math.random() * 100),

    client: client._id,
    contractor: contractor._id,

    clauses: [
      "Confidentiality must be maintained",
      "Quality standards are mandatory"
    ],

    keypoints: [
      "Milestone based payment",
      "Legally binding agreement",
      "Requires compliance & quality"
    ],

    summary,
    contractContent: content,
    contractStatus: ["pending", "active", "completed"][i % 3]
  });

  contracts.push(contract);
}

console.log("📄 Contracts Created with Realistic Content");

 

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
