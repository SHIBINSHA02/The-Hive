// types/conversation.ts

export interface ConversationMessage {
  _id?: string;
  senderId: string;
  senderRole: "client" | "contractor" | "system" | "owner" | "partyB";
  message: string;
  attachments?: string[];
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationThread {
  _id: string;
  subject: string;
  messages: ConversationMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationParticipants {
  client: string;
  contractor: string;
}

export interface ConversationType {
  _id: string;
  conversationId: string;
  contractId: string;
  participants: ConversationParticipants;
  threads: ConversationThread[];
  lastMessage?: string;
  status: "active" | "closed";
  createdAt?: string;
  updatedAt?: string;
}
