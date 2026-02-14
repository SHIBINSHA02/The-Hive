// app/(protected)/dashboard/requests/_components/types.ts
// Contract / Request Status
export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Main Request / Contract Card Type
export interface ContractRequest {
  id: string;

  // Company info
  companyName: string;
  companyLogo: string;

  // Visuals
  backgroundImage: string;

  // Contract details
  title: string;
  description: string;
  content?: string; // Full contract text (used in view page)

  // Dates
  startDate: string;
  deadline: string;

  // Financials
  amount: string;

  // Progress tracking
  progress: number; // 0 - 100

  // Status
  status: RequestStatus;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}
