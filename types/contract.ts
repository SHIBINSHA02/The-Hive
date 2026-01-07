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
