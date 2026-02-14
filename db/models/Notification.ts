// db/models/Notification.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'request' | 'alert' | 'payment' | 'update';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'overdue';
  contractName?: string;
  contractId?: string;
  contract?: mongoose.Types.ObjectId;
  amount?: number;
  dueDate?: Date;
  sender?: string;
  senderAvatar?: string;
  isRead: boolean;
  actions?: Array<{
    label: string;
    type: 'primary' | 'secondary' | 'destructive';
    action: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['request', 'alert', 'payment', 'update'],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'overdue'],
      default: 'pending',
      index: true
    },
    contractName: String,
    contractId: String,
    contract: {
      type: Schema.Types.ObjectId,
      ref: "Contract"
    },
    amount: Number,
    dueDate: Date,
    sender: String,
    senderAvatar: String,
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    actions: [{
      label: String,
      type: {
        type: String,
        enum: ['primary', 'secondary', 'destructive']
      },
      action: String
    }]
  },
  { timestamps: true }
);

// Compound index for efficient queries
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, type: 1, status: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
