import mongoose, { Schema, Document, Model } from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize Gemini (optionally, based on env)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
let embeddingsEnabled = false;
let embeddingErrorLogged = false;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set; contract embeddings are disabled.");
} else {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  embeddingsEnabled = true;
}

// --- NEW: Interface for Version History Objects ---
// This defines the shape of a single edit snapshot.
export interface IVersionSnapshot {
  updatedBy: string;
  updatedAt: Date;
  contentSnapshot: string;
  action: "proposed_edit" | "reverted" | "accepted";
}

export interface IContract extends Document {
  ownerId: string;
  contractId: string;
  contractTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  bgImageUrl?: string;
  description?: string;
  startDate: Date;
  deadline: Date;
  progress: number;
  client: mongoose.Types.ObjectId;
  contractor: mongoose.Types.ObjectId;
  conversationId?: string;
  summary?: string;
  clauses: string[];
  keypoints: string[];
  contractType?: string;
  contractContent?: string;
  
  // --- UPDATED: Expanded Status Enum ---
  // Replaced the simple 3 statuses with a strict 6-step state machine
  contractStatus: "draft" | "sent_for_review" | "in_negotiation" | "locked" | "active" | "completed";
  
  embeddings: number[];
  createdAt: Date;
  updatedAt: Date;

  // --- NEW: Phase 2 Negotiation Fields ---
  partyB_Email?: string;         // The email of the person invited to negotiate
  partyB_ClerkId?: string;       // The authenticated Clerk ID of Party B (once they log in)
  versionHistory: IVersionSnapshot[]; // Array holding previous versions of the contract text
  currentTurn: "owner" | "partyB";    // Tracks whose turn it is to edit to prevent collisions

  // --- NEW: Phase 3 Signature Fields ---
  ownerSigned: boolean;
  partyBSigned: boolean;

  // --- NEW: Mutual Agreement Fields ---
  ownerAgreed: boolean;
  partyBAgreed: boolean;
}

const ContractSchema = new Schema<IContract>(
  {
    ownerId: { type: String, required: true },
    contractId: { type: String, required: true, unique: true },
    contractTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    companyLogoUrl: { type: String },
    bgImageUrl: { type: String },
    description: { type: String },
    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    client: { type: Schema.Types.ObjectId, ref: "ClientProfile", required: true },
    contractor: { type: Schema.Types.ObjectId, ref: "ContractProfile", required: true },
    conversationId: { type: String },
    summary: { type: String },
    clauses: { type: [String], default: [] },
    keypoints: { type: [String], default: [] },
    contractType: { type: String },
    contractContent: { type: String },
    
    // --- UPDATED: State Machine Implementation ---
    // The default is now "draft". It moves through these steps sequentially.
    contractStatus: {
      type: String,
      enum: ["draft", "sent_for_review", "in_negotiation", "locked", "active", "completed"],
      default: "draft",
    },
    
    embeddings: {
      type: [Number],
      default: [],
    },

    // --- NEW: Negotiation Data Storage ---
    
    // Captures the target email before Party B even creates an account.
    partyB_Email: { type: String, trim: true },
    
    // Acts as the security key. Party B can only access the document if their Clerk ID matches this.
    partyB_ClerkId: { type: String },
    
    // The ledger of changes. Prevents Party B from deleting data without Party A noticing.
    versionHistory: [
      {
        updatedBy: { type: String }, 
        updatedAt: { type: Date, default: Date.now }, 
        contentSnapshot: { type: String }, 
        action: { type: String, enum: ["proposed_edit", "reverted", "accepted"] } 
      }
    ],

    // The traffic light system. Only the person whose turn it is can see the "Edit" buttons.
    currentTurn: {
      type: String,
      enum: ["owner", "partyB"],
      default: "owner"
    },

    // --- NEW: Signature Tracking ---
    ownerSigned: { type: Boolean, default: false },
    partyBSigned: { type: Boolean, default: false },

    // --- NEW: Mutual Agreement Tracking ---
    ownerAgreed: { type: Boolean, default: false },
    partyBAgreed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * UTILITY: Generate Embedding Text
 */
const getEmbedText = (doc: any) => {
  return `
    Title: ${doc.contractTitle}
    Company: ${doc.companyName}
    Summary: ${doc.summary || ""}
    Keypoints: ${doc.keypoints?.join(", ") || ""}
    Content: ${doc.contractContent || ""}
  `.trim();
};

/**
 * PRE-SAVE HOOK (For .save() and .create())
 */
ContractSchema.pre("save", async function () {
  const needsUpdate =
    this.isModified("contractContent") ||
    this.isModified("summary") ||
    this.isModified("contractTitle") ||
    this.embeddings.length === 0;

  if (needsUpdate && embeddingsEnabled && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await model.embedContent(getEmbedText(this));
      this.embeddings = result.embedding.values;
    } catch (err) {
      if (!embeddingErrorLogged) {
        console.error(
          "Embedding generation failed on save; disabling further embedding attempts until restart.",
          err
        );
        embeddingErrorLogged = true;
      }
      embeddingsEnabled = false;
    }
  }
});

/**
 * PRE-UPDATE HOOK (For findOneAndUpdate)
 */
ContractSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as any;

  // Check if any text fields are being updated
  const textChanged = update.contractContent || update.summary || update.contractTitle;

  if (textChanged && embeddingsEnabled && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await model.embedContent(getEmbedText(update));
      this.setUpdate({ ...update, embeddings: result.embedding.values });
    } catch (err) {
      if (!embeddingErrorLogged) {
        console.error(
          "Embedding generation failed on update; disabling further embedding attempts until restart.",
          err
        );
        embeddingErrorLogged = true;
      }
      embeddingsEnabled = false;
    }
  }
});

const Contract: Model<IContract> =
  mongoose.models.Contract || mongoose.model<IContract>("Contract", ContractSchema);

export default Contract;