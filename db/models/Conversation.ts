import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
  senderId: string;
  senderRole: "client" | "contractor" | "system" | "owner" | "partyB";
  message: string;
  attachments: string[];
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IThread {
  _id: mongoose.Types.ObjectId;
  subject: string;
  messages: IMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConversation extends Document {
  conversationId: string;
  contractId: string;
  participants: {
    client: string;
    contractor: string;
  };
  threads: mongoose.Types.DocumentArray<IThread>;
  messages: IMessage[];
  lastMessage?: string;
  status: "active" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema(
  {
    senderId: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["client", "contractor", "system", "owner", "partyB"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ThreadSchema = new Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const ConversationSchema = new Schema<IConversation>(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
    },

    contractId: {
      type: String,
      required: true,
    },

    participants: {
      client: {
        type: String,
        required: true,
      },
      contractor: {
        type: String,
        required: true,
      },
    },

    /** Structured threads: each has a subject and messages. When present, use these. */
    threads: {
      type: [ThreadSchema],
      default: [],
    },

    /** Legacy flat messages (used when no threads, or for backward compatibility) */
    messages: {
      type: [MessageSchema],
      default: [],
    },

    lastMessage: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  { timestamps: true }
);

const ContractConversation: Model<IConversation> =
  mongoose.models.ContractConversation || mongoose.model<IConversation>("ContractConversation", ConversationSchema);

export default ContractConversation;
