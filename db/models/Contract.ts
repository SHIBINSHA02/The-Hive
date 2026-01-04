// db/models/Contract.ts
import mongoose from "mongoose";

const ContractSchema = new mongoose.Schema({
  contractId: {
    type: String,
    required: true,
    unique: true
  },

  contractTitle: {
    type: String,
    required: true
  },

  companyName: {
    type: String,
    required: true
  },

  companyLogoUrl: {
    type: String
  },

  bgImageUrl: {
    type: String
  },

  description: {
    type: String
  },

  startDate: {
    type: Date,
    required: true
  },

  deadline: {
    type: Date,
    required: true
  },

  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  client: {
    type: String,
    required: true
  },

  contractor: {
    type: String,
    required: true
  },

  conversationId: {
    type: String
  },

  summary: {
    type: String
  },

  clauses: {
    type: [String],
    default: []
  },

  keypoints: {
    type: [String],
    default: []
  },

  contractType: {
    type: String
  },

  contractContent: {
    type: String
  },

  contractStatus: {
    type: String,
    enum: ["active", "pending", "completed"],
    default: "pending"
  }

}, { timestamps: true });

export default mongoose.model("Contract", ContractSchema);
