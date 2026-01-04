// db/models/Finance.ts
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },

  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  description: String,

  paymentMethod: {
    type: String,
    enum: ["bank_transfer", "upi", "card", "cash", "wallet", "other"],
    default: "other"
  },

  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },

  date: {
    type: Date,
    default: Date.now
  }
});


const MilestoneSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  dueDate: Date,
  isPaid: {
    type: Boolean,
    default: false
  }
});


const FinancialSchema = new mongoose.Schema({

  financialId: {
    type: String,
    required: true,
    unique: true
  },

  contractId: {
    type: String,
    required: true
  },

  client: {
    type: String,
    required: true
  },

  contractor: {
    type: String,
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  paidAmount: {
    type: Number,
    default: 0
  },

  dueAmount: {
    type: Number,
    default: 0
  },

  currency: {
    type: String,
    default: "INR"
  },

  milestones: {
    type: [MilestoneSchema],
    default: []
  },

  transactions: {
    type: [TransactionSchema],
    default: []
  },

  paymentStatus: {
    type: String,
    enum: ["not_started", "in_progress", "partial", "completed", "overdue"],
    default: "not_started"
  },

  lastPaymentDate: Date,

}, { timestamps: true });

export default mongoose.model("Financial", FinancialSchema);
