"use client";

import React, { useEffect, useState } from "react";
import * as Lucide from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { ReminderCard } from "@/components/dashboard/ReminderCard";
import { EmergencyEmailDialog } from "@/components/dashboard/EmergencyEmailDialog";
import { LifecycleContract } from "@/types/lifecycle";

export default function LifecyclePage() {
  const [data, setData] = useState<{
    stats: any;
    deadlines: LifecycleContract[];
    delayed: LifecycleContract[];
    upcoming: LifecycleContract[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLifecycleData = async () => {
      try {
        const res = await fetch("/api/lifecycle");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch lifecycle data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLifecycleData();
  }, []);

  const handleSendReminder = (contract: LifecycleContract) => {
    alert(`Reminder email functionality will be connected to ${contract.email} later.`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Lucide.Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  // Fallbacks if data is empty
  const stats = data?.stats || { formattedPipeline: "$0", activeContracts: 0, urgentAlerts: 0, overduePayments: 0 };
  const deadlineContracts = data?.deadlines || [];
  const delayedPayments = data?.delayed || [];
  const upcomingPayments = data?.upcoming || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 lg:p-12 space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">Contract Lifecycle</h1>
            <p className="text-slate-500 font-medium">Intelligence-driven tracking and proactive reminders.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input type="text" placeholder="Search contracts..." className="bg-white border border-slate-200 px-4 py-3 rounded-2xl w-80 pl-12 focus:ring-2 focus:ring-indigo-500" />
              <Lucide.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <EmergencyEmailDialog />
          </div>
        </header>

        {/* Dynamic Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Pipeline Value" value={stats.formattedPipeline} icon={Lucide.DollarSign} trend={{ value: 0, isPositive: true }} />
          <StatCard title="Active Contracts" value={stats.activeContracts.toString()} icon={Lucide.FileText} trend={{ value: 0, isPositive: true }} />
          <StatCard title="Urgent Alerts" value={stats.urgentAlerts.toString()} icon={Lucide.AlertTriangle} trend={{ value: 0, isPositive: false }} />
          <StatCard title="Payments Overdue" value={stats.overduePayments.toString()} icon={Lucide.Clock} trend={{ value: 0, isPositive: false }} />
        </div>

        {/* High Priority */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-100 rounded-lg"><Lucide.Flame className="w-5 h-5 text-rose-800" /></div>
              <h2 className="text-2xl font-bold">High Priority</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Show top 4 most urgent items across deadlines and payments */}
            {[...deadlineContracts, ...upcomingPayments, ...delayedPayments].slice(0, 4).map((c) => (
              <ReminderCard key={c.id} contract={c} onAction={handleSendReminder} />
            ))}
            {deadlineContracts.length === 0 && delayedPayments.length === 0 && upcomingPayments.length === 0 && (
                <p className="text-slate-500 italic col-span-full">No high priority items right now. You're all caught up!</p>
            )}
          </div>
        </section>

        {/* Tabs + Lists */}
        <div className="bg-white rounded-3xl p-8">
          <div className="flex space-x-6 border-b border-gray-500 pb-4 overflow-x-auto">
            <TabItem label="Upcoming Deadlines" active />
            <TabItem label="Delayed Payments" />
            <TabItem label="Upcoming Payments" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 mt-8">
            <div className="xl:col-span-2 space-y-4">
              <h3 className="text-xl font-bold">Deadline Approaching</h3>
              {deadlineContracts.length === 0 ? <p className="text-sm text-gray-400">No upcoming deadlines.</p> : null}
              {deadlineContracts.map((c) => (
                <ContractRow key={c.id} contract={c} onRemind={handleSendReminder} />
              ))}
            </div>

            {/* Overdue Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Overdue Payments</h3>
              {delayedPayments.length === 0 ? <p className="text-sm text-gray-400">No overdue payments.</p> : null}
              {delayedPayments.map((c) => (
                <div key={c.id} className="p-4 bg-rose-50 border border-gray-200 rounded-2xl flex justify-between">
                  <div>
                    <p className="font-bold">{c.clientName}</p>
                    <p className="text-xs text-rose-700">Due: {c.deadline}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black">{c.amount}</p>
                    <button onClick={() => handleSendReminder(c)} className="text-[10px] font-black uppercase text-rose-600">Send Nudge</button>
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

const TabItem = ({ label, active = false }: { label: string; active?: boolean; }) => (
  <button className={`pb-2 font-semibold ${active ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500"}`}>{label}</button>
);

const ContractRow = ({ contract, onRemind }: { contract: LifecycleContract; onRemind: (contract: LifecycleContract) => void; }) => (
  <div className="p-4 border border-gray-200 rounded-xl flex justify-between bg-slate-50">
    <div>
      <p className="font-bold">{contract.clientName}</p>
      <p className="text-xs text-slate-500">{contract.contractTitle}</p>
    </div>
    <div className="text-right">
      <p className="font-bold">{contract.deadline}</p>
      <button className="text-xs text-indigo-600" onClick={() => onRemind(contract)}>Send Reminder</button>
    </div>
  </div>
);