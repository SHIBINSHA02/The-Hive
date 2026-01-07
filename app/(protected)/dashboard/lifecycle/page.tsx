"use client";

import React from "react";
import * as Lucide from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { ReminderCard } from "@/components/dashboard/ReminderCard";
import { EmergencyEmailDialog } from "@/components/dashboard/EmergencyEmailDialog";

import { LifecycleContract } from "@/types/lifecycle";

// ---------------- MOCK DATA ----------------
const deadlineContracts: LifecycleContract[] = [
  {
    id: "1",
    clientName: "Acme Corp",
    contractTitle: "Software License Agreement",
    deadline: "Dec 2, 2024",
    amount: "$45,000",
    status: "urgent",
    email: "contact@acme.com",
    category: "deadline",
  },
  {
    id: "2",
    clientName: "TechStart Inc",
    contractTitle: "Service Level Agreement",
    deadline: "Dec 5, 2024",
    amount: "$28,500",
    status: "urgent",
    email: "legal@techstart.com",
    category: "deadline",
  },
  {
    id: "3",
    clientName: "Global Solutions",
    contractTitle: "Partnership Contract",
    deadline: "Dec 8, 2024",
    amount: "$125,000",
    status: "warning",
    email: "partnerships@global.com",
    category: "deadline",
  },
  {
    id: "4",
    clientName: "Innovate Labs",
    contractTitle: "NDA Agreement",
    deadline: "Dec 12, 2024",
    amount: "$5,000",
    status: "warning",
    email: "legal@innovate.com",
    category: "deadline",
  },
];

const delayedPayments: LifecycleContract[] = [
  {
    id: "6",
    clientName: "Alpha Industries",
    contractTitle: "Consulting Agreement",
    deadline: "Nov 15, 2024",
    amount: "$32,000",
    status: "overdue",
    email: "finance@alpha.com",
    category: "delayed",
  },
  {
    id: "7",
    clientName: "Beta Corp",
    contractTitle: "Maintenance Contract",
    deadline: "Nov 20, 2024",
    amount: "$18,500",
    status: "overdue",
    email: "accounts@beta.com",
    category: "delayed",
  },
];

const upcomingPayments: LifecycleContract[] = [
  {
    id: "10",
    clientName: "Zenith Corp",
    contractTitle: "Annual License",
    deadline: "Dec 1, 2024",
    amount: "$15,000",
    status: "urgent",
    email: "finance@zenith.com",
    category: "payment",
  },
  {
    id: "11",
    clientName: "Phoenix Ltd",
    contractTitle: "Subscription Plan",
    deadline: "Dec 3, 2024",
    amount: "$8,500",
    status: "urgent",
    email: "billing@phoenix.com",
    category: "payment",
  },
];

// -----------------------------------------------------

export default function LifecyclePage() {
  const handleSendReminder = (contract: LifecycleContract) => {
    alert(
      `Reminder email sent to ${contract.clientName} for contract "${contract.contractTitle}"`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 lg:p-12 space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">
              Contract Lifecycle
            </h1>
            <p className="text-slate-500 font-medium">
              Intelligence-driven tracking and proactive reminders.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contracts..."
                className="bg-white border border-slate-200 px-4 py-3 rounded-2xl w-80 pl-12 focus:ring-2 focus:ring-indigo-500"
              />
              <Lucide.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <EmergencyEmailDialog />
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pipeline Value"
            value="$1.2M"
            icon={Lucide.DollarSign}
            trend={{ value: 12.5, isPositive: true }}
          />

          <StatCard
            title="Active Contracts"
            value="48"
            icon={Lucide.FileText}
            trend={{ value: 4, isPositive: true }}
          />

          <StatCard
            title="Urgent Alerts"
            value="8"
            icon={Lucide.AlertTriangle}
            trend={{ value: 0, isPositive: false }}
          />

          <StatCard
            title="Payments Overdue"
            value="3"
            icon={Lucide.Clock}
            trend={{ value: -2, isPositive: false }}
          />
        </div>

        {/* High Priority */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Lucide.Flame className="w-5 h-5 text-rose-800" />
              </div>
              <h2 className="text-2xl font-bold">High Priority</h2>
            </div>
            <button className="text-indigo-600 font-bold text-sm hover:underline">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...deadlineContracts.slice(0, 2), ...upcomingPayments.slice(0, 2)].map(
              (c) => (
                <ReminderCard
                  key={c.id}
                  contract={c}
                  onAction={handleSendReminder}
                />
              )
            )}
          </div>
        </section>

        {/* Tabs + Lists */}
        <div className="bg-white  rounded-3xl p-8">
          <div className="flex space-x-6 border-b border-gray-500 pb-4 overflow-x-auto">
            <TabItem label="Upcoming Deadlines" active />
            <TabItem label="Delayed Payments" />
            <TabItem label="Upcoming Payments" />
            <TabItem label="History" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 mt-8">
            <div className="xl:col-span-2 space-y-4">
              <h3 className="text-xl font-bold">Deadline Approaching</h3>

              {deadlineContracts.map((c) => (
                <ContractRow
                  key={c.id}
                  contract={c}
                  onRemind={handleSendReminder}
                />
              ))}
            </div>

            {/* Overdue Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Overdue Payments</h3>

              {delayedPayments.map((c) => (
                <div
                  key={c.id}
                  className="p-4 bg-rose-50 border border-gray-200  rounded-2xl flex justify-between"
                >
                  <div>
                    <p className="font-bold">{c.clientName}</p>
                    <p className="text-xs text-rose-700">Due: {c.deadline}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-black">{c.amount}</p>
                    <button
                      onClick={() => handleSendReminder(c)}
                      className="text-[10px] font-black uppercase text-rose-600"
                    >
                      Send Nudge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- Helper Components ---------------- */

const TabItem = ({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) => (
  <button
    className={`pb-2 font-semibold ${
      active ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500"
    }`}
  >
    {label}
  </button>
);

const ContractRow = ({
  contract,
  onRemind,
}: {
  contract: LifecycleContract;
  onRemind: (contract: LifecycleContract) => void;
}) => (
  <div className="p-4 border border-gray-200 rounded-xl flex justify-between bg-slate-50">
    <div>
      <p className="font-bold">{contract.clientName}</p>
      <p className="text-xs text-slate-500">{contract.contractTitle}</p>
    </div>

    <div className="text-right">
      <p className="font-bold">{contract.deadline}</p>
      <button
        className="text-xs text-indigo-600"
        onClick={() => onRemind(contract)}
      >
        Send Reminder
      </button>
    </div>
  </div>
);
