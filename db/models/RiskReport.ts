import mongoose, { Schema, Document } from "mongoose";

export interface IRiskReport extends Document {
  userId: string;
  fileName: string;
  extractedText: string;
  riskScore: number;
  risks: Array<{
    clause: string;
    issue: string;
    suggestion: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  createdAt: Date;
}

const RiskReportSchema = new Schema({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  extractedText: { type: String, required: true },
  riskScore: { type: Number, default: 0 },
  risks: [{
    clause: String,
    issue: String,
    suggestion: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.RiskReport || mongoose.model<IRiskReport>("RiskReport", RiskReportSchema);