// db/models/Conversation.ts
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ["client", "contractor", "system"],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: {
    type: [String],
    default: []
  },
  isRead: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

const ThreadSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  messages: {
    type: [MessageSchema],
    default: []
  }
}, { timestamps: true });

const ConversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    unique: true
  },

  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contract",
    required: true
  },

  participants: {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientProfile",
      required: true
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContractProfile",
      required: true
    }
  },

  /** Structured threads: each has a subject and messages. When present, use these. */
  threads: {
    type: [ThreadSchema],
    default: []
  },

  /** Legacy flat messages (used when no threads, or for backward compatibility) */
  messages: {
    type: [MessageSchema],
    default: []
  },

  lastMessage: {
    type: String
  },

  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active"
  }

}, { timestamps: true });

export default mongoose.model("Conversation", ConversationSchema);
