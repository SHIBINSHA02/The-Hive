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

export interface IContract extends Document {
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
  contractStatus: "active" | "pending" | "completed";
  embeddings: number[]; // Store the 768-dim vector here
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
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
    contractStatus: {
      type: String,
      enum: ["active", "pending", "completed"],
      default: "pending",
    },
    embeddings: {
      type: [Number],
      default: [],
    },
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
 * In Mongoose 8, async hooks do not take a 'next' parameter.
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
 * Handles updates where the document is not in memory.
 */
ContractSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as any;

  // Check if any text fields are being updated
  const textChanged = update.contractContent || update.summary || update.contractTitle;

  if (textChanged && embeddingsEnabled && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      // Note: This only works well if the update object contains enough info
      // for a useful embedding.
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