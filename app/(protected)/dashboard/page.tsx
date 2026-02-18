// app/(protected)/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Users, DollarSign, FileText, AlertCircle, TrendingUp, Briefcase } from "lucide-react";
import Link from "next/link";

import { EmergencyEmailDialog } from "@/components/dashboard/EmergencyEmailDialog";
import { StatCard } from "@/components/dashboard/StatCard";
import { RowContractCard } from "@/components/dashboard/RowContractCard";
import { Contract } from "@/types/contract";

interface ContractorStats {
  totalClients: number;
  totalRevenue: number;
  activeContracts: number;
  pendingActions: number;
}

export default function ContractorDashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractorStats>({
    totalClients: 0,
    totalRevenue: 0,
    activeContracts: 0,
    pendingActions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContractorData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/contracts");
        if (!res.ok) throw new Error("Failed to fetch contracts");

        const data: Contract[] = await res.json();
        
        // Filter to only contractor contracts
        const contractorContracts = data.filter(
          (contract) => contract.viewerRole === "contractor"
        );

        setContracts(contractorContracts);

        // Calculate statistics
        const uniqueClients = new Set(
          contractorContracts
            .map((c) => c.clientName)
            .filter((name) => name !== undefined)
        ).size;

        // Fetch financial data for revenue calculation
        let totalRevenue = 0;
        const revenuePromises = contractorContracts.map(async (contract) => {
          try {
            const financeRes = await fetch(`/api/contracts/${contract._id}`);
            if (financeRes.ok) {
              const financeData = await financeRes.json();
              if (financeData.finance?.paidAmount) {
                return financeData.finance.paidAmount;
              }
            }
          } catch (err) {
            // Silently fail for individual finance fetches
          }
          return 0;
        });

        const revenues = await Promise.all(revenuePromises);
        totalRevenue = revenues.reduce((sum, rev) => sum + rev, 0);

        const activeContracts = contractorContracts.filter(
          (c) => c.contractStatus === "active"
        ).length;

        // Calculate pending actions (contracts with upcoming deadlines or pending status)
        const now = new Date();
        const pendingActions = contractorContracts.filter((contract) => {
          const deadline = new Date(contract.deadline);
          const daysUntilDeadline = Math.ceil(
            (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return (
            contract.contractStatus === "pending" ||
            (daysUntilDeadline <= 7 && daysUntilDeadline >= 0)
          );
        }).length;

        setStats({
          totalClients: uniqueClients,
          totalRevenue,
          activeContracts,
          pendingActions,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchContractorData();
  }, []);

  // Get recent contractor contracts (limit to 5)
  const recentContracts = contracts
    .filter((c) => c.viewerRole === "contractor")
    .slice(0, 5);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-scroll h-[95vh]">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-blue-700">Loading contractor dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-scroll h-[95vh]">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-red-600 font-semibold">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-scroll h-[95vh]">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                Contractor Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your contracts, track revenue, and monitor client relationships
              </p>
            </div>
            <EmergencyEmailDialog />
          </div>
        </header>

        {/* Statistics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Clients"
            value={stats.totalClients.toString()}
            icon={Users}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Active Contracts"
            value={stats.activeContracts.toString()}
            icon={FileText}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Pending Actions"
            value={stats.pendingActions.toString()}
            icon={AlertCircle}
            trend={{ value: 0, isPositive: false }}
          />
        </section>

        {/* Recent Contracts Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                My Contracts
              </h2>
              <p className="mt-2 text-lg text-blue-500">
                Overview of your active and recent contract engagements
              </p>
            </div>
            <Link
              href="/dashboard/mycontracts"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Briefcase className="h-4 w-4" />
              View All Contracts
            </Link>
          </div>

          {recentContracts.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-md text-center">
              <p className="text-gray-600 text-lg">
                No contracts found. Start by creating your first contract!
              </p>
              <Link
                href="/dashboard/mycontracts/create-contract"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Create Contract
              </Link>
            </div>
          ) : (
            recentContracts.map((contract) => (
              <Link
                key={contract._id}
                href={`/dashboard/mycontracts/${contract._id}`}
                className="block"
              >
                <RowContractCard
                  companyName={contract.companyName}
                  companyLogo={contract.companyLogoUrl || ""}
                  title={contract.contractTitle}
                  description={contract.description || contract.summary || ""}
                  startDate={new Date(contract.startDate).toLocaleDateString()}
                  deadline={new Date(contract.deadline).toLocaleDateString()}
                  progress={contract.progress || 0}
                />
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}