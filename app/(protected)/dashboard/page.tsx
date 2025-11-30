// app/(protected)/dashboard/page.tsx
"use client";
import { Users, DollarSign, Activity, FileText, Clock, AlertCircle } from "lucide-react";

import { EmergencyEmailDialog } from "@/components/dashboard/EmergencyEmailDialog";

import { ContractTable, Contract } from "@/components/dashboard/ContractTable";
// Mock data for demonstration
const deadlineContracts: Contract[] = [
  { id: "1", clientName: "Acme Corp", contractTitle: "Software License Agreement", deadline: "Dec 2, 2024", amount: "$45,000", status: "urgent", email: "contact@acme.com" },
  { id: "2", clientName: "TechStart Inc", contractTitle: "Service Level Agreement", deadline: "Dec 5, 2024", amount: "$28,500", status: "urgent", email: "legal@techstart.com" },
  { id: "3", clientName: "Global Solutions", contractTitle: "Partnership Contract", deadline: "Dec 8, 2024", amount: "$125,000", status: "warning", email: "partnerships@global.com" },
  { id: "4", clientName: "Innovate Labs", contractTitle: "NDA Agreement", deadline: "Dec 12, 2024", amount: "$5,000", status: "warning", email: "legal@innovate.com" },
  { id: "5", clientName: "Summit Holdings", contractTitle: "Vendor Agreement", deadline: "Dec 15, 2024", amount: "$67,000", status: "normal", email: "procurement@summit.com" },
];

const delayedPayments: Contract[] = [
  { id: "6", clientName: "Alpha Industries", contractTitle: "Consulting Agreement", deadline: "Nov 15, 2024", amount: "$32,000", status: "overdue", email: "finance@alpha.com" },
  { id: "7", clientName: "Beta Corp", contractTitle: "Maintenance Contract", deadline: "Nov 20, 2024", amount: "$18,500", status: "overdue", email: "accounts@beta.com" },
  { id: "8", clientName: "Delta Systems", contractTitle: "Support Agreement", deadline: "Nov 25, 2024", amount: "$24,000", status: "overdue", email: "billing@delta.com" },
  { id: "9", clientName: "Omega Tech", contractTitle: "Development Contract", deadline: "Nov 28, 2024", amount: "$56,000", status: "overdue", email: "payments@omega.com" },
];

const upcomingPayments: Contract[] = [
  { id: "10", clientName: "Zenith Corp", contractTitle: "Annual License", deadline: "Dec 1, 2024", amount: "$15,000", status: "urgent", email: "finance@zenith.com" },
  { id: "11", clientName: "Phoenix Ltd", contractTitle: "Subscription Plan", deadline: "Dec 3, 2024", amount: "$8,500", status: "urgent", email: "billing@phoenix.com" },
  { id: "12", clientName: "Nova Industries", contractTitle: "Enterprise Plan", deadline: "Dec 7, 2024", amount: "$42,000", status: "warning", email: "accounts@nova.com" },
  { id: "13", clientName: "Apex Solutions", contractTitle: "Pro Subscription", deadline: "Dec 10, 2024", amount: "$12,000", status: "warning", email: "finance@apex.com" },
  { id: "14", clientName: "Prime Tech", contractTitle: "Team License", deadline: "Dec 14, 2024", amount: "$22,500", status: "normal", email: "billing@prime.com" },
  { id: "15", clientName: "Elite Corp", contractTitle: "Annual Support", deadline: "Dec 18, 2024", amount: "$35,000", status: "normal", email: "support@elite.com" },
  { id: "16", clientName: "Stellar Inc", contractTitle: "Premium Plan", deadline: "Dec 22, 2024", amount: "$19,000", status: "normal", email: "accounts@stellar.com" },
];

export default function DashboardPage() {

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                Contract Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered contract generation and analysis
              </p>
            </div>
            <EmergencyEmailDialog />
          </div>
        </header>
    </div>
    </div>
  );
}