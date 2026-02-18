// db/seed.ts
import mongoose from "mongoose";
import User from "./models/User.js";
import ClientProfile from "./models/ClientProfile.js";
import ContractProfile from "./models/ContractProfile.js";
import Contract from "./models/Contract.js";
import Financial from "./models/Finance.js";
import Conversation from "./models/Conversation.js";
import Notification from "./models/Notification.js";

import 'dotenv/config';


const MONGO_URI =
  process.env.MONGODB_URI;

// Optionally provide specific Clerk user IDs to seed contracts for
// If not provided, will use all existing users in the database
const TARGET_CLERK_IDS = process.env.SEED_USER_IDS
  ? process.env.SEED_USER_IDS.split(',')
  : [];

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
    // 0️⃣ GET OR CREATE USERS
    // ------------------------------
    let users = [];

    if (TARGET_CLERK_IDS.length > 0) {
      // Use specified Clerk IDs
      for (const clerkId of TARGET_CLERK_IDS) {
        let user = await User.findOne({ clerkId });
        if (!user) {
          user = await User.create({
            clerkId,
            email: `${clerkId}@example.com`,
            name: `User ${clerkId.slice(-8)}`
          });
        }
        users.push(user);
      }
    } else {
      // Use all existing users in the database
      users = await User.find({});
      if (users.length === 0) {
        console.log("⚠️  No users found. Creating sample users...");
        // Create a few sample users if none exist
        for (let i = 0; i < 3; i++) {
          const user = await User.create({
            clerkId: `sample_user_${i + 1}`,
            email: `sample${i + 1}@example.com`,
            name: `Sample User ${i + 1}`
          });
          users.push(user);
        }
      }
    }

    console.log(`👥 Using ${users.length} user(s) for seeding`);

    // ------------------------------
    // 1️⃣ PROFILES
    // ------------------------------
    const clientProfiles = [];
    const contractorProfiles = [];

    for (const user of users) {
      const client = await ClientProfile.create({
        user: user._id,
        name: `Client Profile ${user._id.toString().slice(-4)}`
      });

      const contractor = await ContractProfile.create({
        user: user._id,
        name: `Contractor Profile ${user._id.toString().slice(-4)}`
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

    // Create contracts with different statuses to trigger various notifications
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;

    // Distribute contracts across users - each user gets multiple contracts
    const contractsPerUser = Math.max(5, Math.ceil(15 / users.length));

    for (let i = 0; i < contractsPerUser * users.length; i++) {
      const base = REAL_CONTRACTS[i % REAL_CONTRACTS.length];

      // Assign contracts to users in round-robin fashion
      const userIndex = i % users.length;
      const user = users[userIndex];

      // Find profiles for this user
      const client = clientProfiles.find(p => p.user.toString() === user._id.toString());
      const contractor = contractorProfiles.find(p => p.user.toString() === user._id.toString());

      if (!client || !contractor) {
        console.warn(`⚠️  Skipping contract ${i} - profiles not found for user ${user._id}`);
        continue;
      }

      // For variety, sometimes this user is the client, sometimes the contractor
      // Alternate between users for client/contractor roles
      const otherUserIndex = (userIndex + 1) % users.length;
      const otherUser = users[otherUserIndex];
      const otherClient = clientProfiles.find(p => p.user.toString() === otherUser._id.toString());
      const otherContractor = contractorProfiles.find(p => p.user.toString() === otherUser._id.toString());

      // Decide roles: user is client, other user is contractor (or vice versa)
      const isUserClient = i % 2 === 0;
      const contractClient = isUserClient ? client : (otherClient || client);
      const contractContractor = isUserClient ? (otherContractor || contractor) : contractor;

      const summary = `
This contract establishes an official agreement between ${base.company} and the contractor
for execution of "${base.title}". The agreement defines responsibilities, milestones,
financial commitments, and delivery expectations.
  `.trim();

      const content = `
# ${base.title}

**Company:** ${base.company}  
**Client Profile:** ${contractClient.name}  
**Contractor Profile:** ${contractContractor.name}  
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

      // Create contracts with different scenarios to trigger notifications:
      // 0-4: Pending contracts (will trigger request notifications)
      // 5-9: Active contracts expiring soon (will trigger expiration alerts)
      // 10-12: Active contracts with normal deadlines
      // 13-14: Completed contracts (will trigger update notifications)

      let contractStatus: "pending" | "active" | "completed";
      let deadline: Date;
      let startDate: Date;

      if (i < 5) {
        // Pending contracts - some urgent (due soon), some normal
        contractStatus = "pending";
        startDate = new Date(now - oneDay * (i + 1));
        deadline = new Date(now + oneDay * (i < 2 ? 2 : 10)); // First 2 are urgent (2 days), rest are 10 days
      } else if (i < 10) {
        // Active contracts expiring soon (5-25 days)
        contractStatus = "active";
        startDate = new Date(now - oneDay * 60);
        deadline = new Date(now + oneDay * (5 + (i - 5) * 5)); // 5, 10, 15, 20, 25 days
      } else if (i < 13) {
        // Active contracts with normal deadlines
        contractStatus = "active";
        startDate = new Date(now - oneDay * 30);
        deadline = new Date(now + oneDay * (60 + i * 10));
      } else {
        // Completed contracts
        contractStatus = "completed";
        startDate = new Date(now - oneDay * 90);
        deadline = new Date(now - oneDay * (i - 12)); // Recently completed (1-3 days ago)
      }

      const contract = await Contract.create({
        contractId: `CON-${1000 + i}`,
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
        contractStatus
      });

      contracts.push(contract);
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
