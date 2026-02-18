import mongoose, { Schema, Document, Model } from "mongoose";

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
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    contractId: {
      type: String,
      required: true,
      unique: true,
    },
    contractTitle: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    companyLogoUrl: {
      type: String,
    },
    bgImageUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "ClientProfile",
      required: true,
    },
    contractor: {
      type: Schema.Types.ObjectId,
      ref: "ContractProfile",
      required: true,
    },
    conversationId: {
      type: String,
    },
    summary: {
      type: String,
    },
    clauses: {
      type: [String],
      default: [],
    },
    keypoints: {
      type: [String],
      default: [],
    },
    contractType: {
      type: String,
    },
    contractContent: {
      type: String,
    },
    contractStatus: {
      type: String,
      enum: ["active", "pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Contract: Model<IContract> =
  mongoose.models.Contract || mongoose.model<IContract>("Contract", ContractSchema);

export default Contract;
