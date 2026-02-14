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
  contractStatus: "pending" | "active" | "completed" | string;

  clauses?: string[];
  keypoints?: string[];
  contractContent: string;
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
