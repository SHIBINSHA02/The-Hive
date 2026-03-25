// types/contract.ts
export interface Contract {
  _id: string;
  contractId: string;
  contractTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  bgImageUrl?: string;

  description?: string;
  summary?: string;

  startDate: string;
  deadline: string;

  progress: number;
  contractStatus: "draft" | "sent_for_review" | "in_negotiation" | "locked" | "active" | "completed" | "terminated" | string;

  clauses?: string[];
  keypoints?: string[];
  contractContent: string;

  ownerSigned: boolean;
  partyBSigned: boolean;
  ownerAgreed: boolean;
  partyBAgreed: boolean;
  partyB_Email?: string; // Captured email for sending invitations
  ownerEmail?: string;    // Email of the contract owner (fetched from Clerk/User DB)

  // Populated by API in some views
  clientName?: string;
  contractorName?: string;

  // Derived for the logged-in viewer (list/detail views)
  viewerRole?: "client" | "contractor" | "owner" | "partyB";
  counterpartyName?: string;
  currentTurn?: "owner" | "partyB";
  versionHistory?: { contentSnapshot: string; updatedAt: Date }[];
}

export interface FinanceMilestone {
  title?: string;
  amount: number;
  dueDate: string | Date;
  isPaid: boolean;
}

export interface Financial {
  _id: string;
  financialId: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  currency?: string;
  milestones?: FinanceMilestone[];
  paymentStatus?: "not_started" | "in_progress" | "partial" | "completed" | "overdue";
}
