// types/contract.ts
type Contract = {
      _id: string;
  companyName: string;
  companyLogoUrl?: string;
  contractTitle: string;
  description?: string;
  summary?: string;
  startDate: string;
  deadline: string;
  progress?: number;
  bgImageUrl?: string;
  contractStatus: "active" | "pending" | "completed";
};
