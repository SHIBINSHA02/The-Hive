import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction {
  transactionId: string;
  type: "credit" | "debit" | "pending";
  amount: number;
  description?: string;
  paymentMethod: "bank_transfer" | "upi" | "card" | "cash" | "wallet" | "other";
  status: "pending" | "paid" | "failed" | "refunded";
  date: Date;
}

export interface IMilestone {
  title?: string;
  amount: number;
  dueDate?: Date;
  isPaid: boolean;
}

export interface IFinancial extends Document {
  financialId: string;
  contract: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  contractor: mongoose.Types.ObjectId;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  currency: string;
  milestones: IMilestone[];
  transactions: ITransaction[];
  paymentStatus: "not_started" | "in_progress" | "partial" | "completed" | "overdue";
  lastPaymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema({
  transactionId: { type: String, required: true },

  type: {
    type: String,
    enum: ["credit", "debit", "pending"],
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  description: String,

  paymentMethod: {
    type: String,
    enum: ["bank_transfer", "upi", "card", "cash", "wallet", "other"],
    default: "other",
  },

  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const MilestoneSchema = new Schema({
  title: String,
  amount: Number,
  dueDate: Date,
  isPaid: {
    type: Boolean,
    default: false,
  },
});

const FinancialSchema = new Schema<IFinancial>(
  {
    financialId: {
      type: String,
      required: true,
      unique: true,
    },

    contract: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
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

    totalAmount: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    milestones: {
      type: [MilestoneSchema],
      default: [],
    },

    transactions: {
      type: [TransactionSchema],
      default: [],
    },

    paymentStatus: {
      type: String,
      enum: ["not_started", "in_progress", "partial", "completed", "overdue"],
      default: "not_started",
    },

    lastPaymentDate: Date,
  },
  { timestamps: true }
);

const Financial: Model<IFinancial> =
  mongoose.models.Financial || mongoose.model<IFinancial>("Financial", FinancialSchema);

export default Financial;
