// db/seed.ts
import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import ClientProfile from "./models/ClientProfile.js";
import ContractProfile from "./models/ContractProfile.js";
import Contract from "./models/Contract.js";
import Financial from "./models/Finance.js";
import Conversation from "./models/Conversation.js";
import Notification from "./models/Notification.js";
import { getContractLogic } from "../lib/contract-templates/logic-registry.js";
import crypto from "crypto";

const MONGO_URI = process.env.MONGODB_URI;

// Specific users to seed contracts for (only these users will be used)
const TARGET_CLERK_IDS = [
  "user_37kiUIRDJeKeynbdqqHtSnNqiZ7",  // Niranjan
  "user_37Iu9HWbBEFsu29EpYo4k2mU7Q3",  // S Shibinsha
  "user_39qqrvxp5qSKzY4WYUd39e4gsdg",  // Hari Shankar j
  "user_39FHsCsyf0shVkgpaV0dQ6Hnt1e",  // Adithya SD
  "user_37q8N4u2oLf8WFYzokpSfooygoO",  // shibin sha2
];

// Set to "true" or "1" to keep existing data (skip clearing collections before seeding)
const PRESERVE_DATA = process.env.SEED_PRESERVE_DATA === "true" || process.env.SEED_PRESERVE_DATA === "1";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🔥 Connected to MongoDB");

    if (!PRESERVE_DATA) {
      // Don't delete existing users - we want to keep real user accounts
      await ClientProfile.deleteMany({});
      await ContractProfile.deleteMany({});
      await Contract.deleteMany({});
      await Financial.deleteMany({});
      await Conversation.deleteMany({});
      await Notification.deleteMany({});
      console.log("🧹 Old Data Cleared (preserving existing users)");
    } else {
      console.log("📌 Preserving existing data (SEED_PRESERVE_DATA is set)");
      const existingCount = await Contract.countDocuments();
      if (existingCount > 0) {
        console.log("⏭️  Contracts already exist. Skipping seed to avoid duplicates.");
        process.exit(0);
      }
    }

    // ------------------------------
    // 0️⃣ GET SPECIFIC USERS ONLY
    // ------------------------------
    const users = [];
    const userNames: Record<string, string> = {
      "user_37kiUIRDJeKeynbdqqHtSnNqiZ7": "Niranjan",
      "user_37Iu9HWbBEFsu29EpYo4k2mU7Q3": "S Shibinsha",
      "user_39qqrvxp5qSKzY4WYUd39e4gsdg": "Hari Shankar j",
      "user_39FHsCsyf0shVkgpaV0dQ6Hnt1e": "Adithya SD",
      "user_37q8N4u2oLf8WFYzokpSfooygoO": "shibin sha2",
    };

    // Only use the specified users
    for (const clerkId of TARGET_CLERK_IDS) {
      const user = await User.findOne({ clerkId });
      if (!user) {
        console.warn(`⚠️  User with clerkId ${clerkId} not found. Skipping...`);
        continue;
      }
      users.push(user);
      console.log(`✅ Found user: ${user.name || userNames[clerkId]} (${clerkId})`);
    }

    if (users.length === 0) {
      console.error("❌ No users found! Please ensure the specified users exist in the database.");
      process.exit(1);
    }

    console.log(`👥 Using ${users.length} user(s) for seeding`);

    // ------------------------------
    // 1️⃣ PROFILES
    // ------------------------------
    const clientProfiles = [];
    const contractorProfiles = [];

    for (const user of users) {
      const userName = user.name || userNames[user.clerkId] || `User ${user._id.toString().slice(-4)}`;
      
      const client = await ClientProfile.create({
        user: user._id,
        name: `${userName} (Client)`
      });

      const contractor = await ContractProfile.create({
        user: user._id,
        name: `${userName} (Contractor)`
      });

      clientProfiles.push(client);
      contractorProfiles.push(contractor);
    }

    console.log("👤 Profiles Created");

    // ------------------------------
    // 2️⃣ CONTRACTS (REALISTIC DATA)
    // ------------------------------
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

    // Create contracts with different statuses to trigger various notifications
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;

    // Create contracts between different pairs of users
    // Each user will have contracts with other users (ensuring variety)
    const contracts = [];
    let contractIndex = 0;

    // Create contracts: each user pairs with other users
    for (let i = 0; i < users.length; i++) {
      const user1 = users[i];
      const client1 = clientProfiles.find(p => p.user.toString() === user1._id.toString());
      const contractor1 = contractorProfiles.find(p => p.user.toString() === user1._id.toString());

      if (!client1 || !contractor1) {
        console.warn(`⚠️  Skipping user ${user1._id} - profiles not found`);
        continue;
      }

      // Create contracts with other users
      for (let j = 0; j < users.length; j++) {
        if (i === j) continue; // Skip self

        const user2 = users[j];
        const client2 = clientProfiles.find(p => p.user.toString() === user2._id.toString());
        const contractor2 = contractorProfiles.find(p => p.user.toString() === user2._id.toString());

        if (!client2 || !contractor2) {
          console.warn(`⚠️  Skipping user ${user2._id} - profiles not found`);
          continue;
        }

        // Alternate roles: sometimes user1 is client, sometimes contractor
        const isUser1Client = (i + j) % 2 === 0;
        const contractClient = isUser1Client ? client1 : client2;
        const contractContractor = isUser1Client ? contractor2 : contractor1;

        // Use different contract templates
        const base = REAL_CONTRACTS[contractIndex % REAL_CONTRACTS.length];

        // Create contracts with different scenarios to trigger notifications:
        // Distribute statuses: draft, active, completed
        let contractStatus: "draft" | "sent_for_review" | "in_negotiation" | "locked" | "active" | "completed";
        let deadline: Date;
        let startDate: Date;

        const statusIndex = contractIndex % 15;
        if (statusIndex < 5) {
          // Draft contracts - some urgent (due soon), some normal
          contractStatus = "draft";
          startDate = new Date(now - oneDay * (statusIndex + 1));
          deadline = new Date(now + oneDay * (statusIndex < 2 ? 2 : 10)); // First 2 are urgent (2 days), rest are 10 days
        } else if (statusIndex < 10) {
          // Active contracts expiring soon (5-25 days)
          contractStatus = "active";
          startDate = new Date(now - oneDay * 60);
          deadline = new Date(now + oneDay * (5 + (statusIndex - 5) * 5)); // 5, 10, 15, 20, 25 days
        } else if (statusIndex < 13) {
          // Active contracts with normal deadlines
          contractStatus = "active";
          startDate = new Date(now - oneDay * 30);
          deadline = new Date(now + oneDay * (60 + statusIndex * 10));
        } else {
          // Completed contracts
          contractStatus = "completed";
          startDate = new Date(now - oneDay * 90);
          deadline = new Date(now - oneDay * (statusIndex - 12)); // Recently completed (1-3 days ago)
        }

        // Use realistic values for exact template generation
        const formData = {
          AGREEMENT_TITLE: base.title,
          PARTY_A_NAME: contractClient.name,
          PARTY_B_NAME: contractContractor.name,
          START_DATE: startDate.toISOString().split('T')[0],
          END_DATE: deadline.toISOString().split('T')[0],
          SERVICE_DESCRIPTION: base.description,
          SERVICE_LOCATION: "Remote",
          PAYMENT_AMOUNT: "5000",
          PAYMENT_CURRENCY: "USD",
          NOTICE_METHOD: "Email",
          EFFECTIVE_DATE: startDate.toISOString().split('T')[0],
          PARTY_A_TYPE: "Individual",
          PARTY_A_ADDRESS: "123 Client St, City",
          PARTY_A_EMAIL: "client@example.com",
          PARTY_B_TYPE: "Company",
          PARTY_B_ADDRESS: "456 Contractor Ave, City",
          PARTY_B_EMAIL: "contractor@example.com",
          DELIVERABLES: "Standard project deliverables",
          PAYMENT_SCHEDULE: "Upon Completion",
          PAYMENT_METHOD: "Bank Transfer",
          CONFIDENTIALITY_TERM: "3 Years",
          IP_OWNERSHIP_MODEL: "Client Owned",
          LIABILITY_CAP: "Contract Value",
          GOVERNING_LAW_STATE: "California",
          GOVERNING_LAW_COUNTRY: "USA",
          DISPUTE_RESOLUTION_METHOD: "Arbitration",
          NOTICE_ADDRESS_PARTY_A: "123 Client St, City",
          NOTICE_ADDRESS_PARTY_B: "456 Contractor Ave, City",
          PARTY_A_SIGNATORY_NAME: contractClient.name,
          PARTY_A_SIGNATORY_TITLE: "Owner",
          PARTY_B_SIGNATORY_NAME: contractContractor.name,
          PARTY_B_SIGNATORY_TITLE: "Representative"
        };
        
        // Use generator from the logic registry
        const templateLogic = getContractLogic("service-agreement");
        const finalContent = templateLogic.generate({
          placeholderValues: formData,
          selectedOptionalClauses: [],
          isDraft: false
        });

        const summary = `Agreement between ${contractClient.name} and ${contractContractor.name}`;
        const content = finalContent;

        console.log(`🧠 Creating static embedding for contract ${contractIndex + 1}: ${base.title} (${contractClient.name} ↔ ${contractContractor.name})...`);
        
        // Mock 768-dimensional embedding array (default size for many embedding models like Gemini)
        // Since the user requested no Gemini dependency, we provide an empty/zeroed array 
        // to satisfy the Mongoose schema requirement without making external API calls
        const embeddingVector = Array(768).fill(0.01);

        const contract = await Contract.create({
          ownerId: user1.clerkId,
          contractId: crypto.randomUUID(),
          contractTitle: base.title,
          companyName: base.company,
          companyLogoUrl: base.logo,
          bgImageUrl: base.bg,
          description: base.description,

          startDate,
          deadline,
          progress: contractStatus === "completed" ? 100 : Math.floor(Math.random() * 80) + 10,

          client: contractClient._id,
          contractor: contractContractor._id,
          
          contractType: "service-agreement",

          clauses: [],

          keypoints: [
            `Service Location: ${formData.SERVICE_LOCATION}`,
            `Payment: ${formData.PAYMENT_AMOUNT} ${formData.PAYMENT_CURRENCY}`,
            `Notice Method: ${formData.NOTICE_METHOD}`
          ],

          summary,
          contractContent: content,
          // Store the embedding vector on the contract for later search/AI use
          embeddings: embeddingVector,
          contractStatus
        });

        contracts.push(contract);
        contractIndex++;
      }
    }

    console.log("📄 Contracts Created with Realistic Content");



    // ------------------------------
    // 3️⃣ FINANCE (with payment milestones to trigger notifications)
    // ------------------------------
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      const total = Math.floor(Math.random() * 50000) + 20000;
      const paid = Math.floor(total / 3); // Less paid to create more due amounts

      // Create milestones with different due dates to trigger payment notifications
      const milestones = [];
      const milestoneCount = 3;
      const milestoneAmount = total / milestoneCount;

      for (let j = 0; j < milestoneCount; j++) {
        let dueDate: Date;
        let isPaid: boolean;

        if (j === 0) {
          // First milestone: already paid
          dueDate = new Date(now - oneDay * 5);
          isPaid = true;
        } else if (j === 1) {
          // Second milestone: due soon (1-7 days) - will trigger payment notifications
          dueDate = new Date(now + oneDay * (1 + (i % 7)));
          isPaid = false;
        } else {
          // Third milestone: due later (8-30 days) or overdue
          if (i < 3) {
            // Some overdue payments
            dueDate = new Date(now - oneDay * (1 + (i % 5)));
            isPaid = false;
          } else {
            dueDate = new Date(now + oneDay * (15 + (i % 15)));
            isPaid = false;
          }
        }

        milestones.push({
          title: `Phase ${j + 1}`,
          amount: milestoneAmount,
          dueDate,
          isPaid
        });
      }

      const dueAmount = total - paid;
      const nowDate = new Date(now);
      const paymentStatus =
        paid >= total ? "completed" :
          dueAmount > 0 && milestones.some(m => !m.isPaid && new Date(m.dueDate) < nowDate) ? "overdue" :
            paid > 0 ? "partial" : "not_started";

      await Financial.create({
        financialId: `FIN-${contract.contractId}`,
        contract: contract._id,
        client: contract.client,
        contractor: contract.contractor,
        totalAmount: total,
        paidAmount: paid,
        dueAmount,
        currency: "USD",

        milestones,

        transactions: [
          {
            transactionId: `TXN-${contract.contractId}-1`,
            type: "credit",
            amount: paid,
            description: "Initial Payment",
            paymentMethod: "upi",
            status: "paid",
            date: new Date(now - oneDay * 5)
          }
        ],

        paymentStatus,
        lastPaymentDate: paid > 0 ? new Date(now - oneDay * 5) : undefined
      });
    }

    console.log("💰 Finance Created");

    // ------------------------------
    // 4️⃣ CONVERSATIONS (structured with subject per thread, linked to contract)
    // ------------------------------
    for (const contract of contracts) {
      const conversation = await Conversation.create({
        conversationId: `CONVO-${contract.contractId}`,
        contractId: contract._id,
        participants: {
          client: contract.client,
          contractor: contract.contractor
        },
        threads: [
          {
            subject: "Contract & project details",
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
            ]
          }
        ],
        messages: [],
        lastMessage: "Sure, let's proceed.",
        status: "active"
      });
      await (Contract as { findByIdAndUpdate: (id: unknown, update: object, options?: object) => Promise<unknown> }).findByIdAndUpdate(contract._id, {
        conversationId: conversation.conversationId
      }, {});
    }

    console.log("💬 Conversations Created");

    // ------------------------------
    // 5️⃣ GENERATE NOTIFICATIONS FROM CONTRACTS
    // ------------------------------
    const { generateAllUserNotifications } = await import("../lib/notificationService.js");
    const result = await generateAllUserNotifications();
    console.log(`🔔 Notifications Generated: ${result.notificationsCreated} notifications for ${result.usersProcessed} users`);

    console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seed Failed", err);
    process.exit(1);
  }
}

seed();
