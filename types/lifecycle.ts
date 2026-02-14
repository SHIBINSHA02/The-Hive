// types/lifecycle.ts
import { Contract } from "./contract";

export interface LifecycleContract extends Partial<Contract> {
  id: string;
  clientName: string;
  contractTitle: string;
  deadline: string;
  amount?: string;
  status: "urgent" | "warning" | "overdue" | string;
  email?: string;
  category: "deadline" | "delayed" | "payment";
}
