'use client';

import React, { useEffect, useState } from 'react';
import RequestCard from './_components/RequestCard';
import { Contract } from '@/types/contract';
import { Inbox, Send, Loader2 } from 'lucide-react';

export default function RequestsPage() {
  // --- STATE MANAGEMENT ---
  const [receivedRequests, setReceivedRequests] = useState<Contract[]>([]);
  const [sentRequests, setSentRequests] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Controls which tab is active
  const [activeTab, setActiveTab] = useState<"inbox" | "outbox">("inbox");

  // --- DATA FETCHING ---
  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Calls the new GET route we built for the Inbox/Outbox
      const res = await fetch("/api/contracts/requests");
      
      if (!res.ok) throw new Error("Failed to fetch requests");
      
      const data = await res.json();
      setReceivedRequests(data.received);
      setSentRequests(data.sent);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Determine which array to show
  const displayedContracts = activeTab === "inbox" ? receivedRequests : sentRequests;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-blue-600">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-medium">Loading your requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Page Title & Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Requests Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review incoming contracts or track the status of agreements you have sent out.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-6 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "inbox"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Received Requests 
          <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
            {receivedRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("outbox")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "outbox"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Send className="w-4 h-4" />
          Sent for Review
          <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
            {sentRequests.length}
          </span>
        </button>
      </div>

      {/* Request Cards Grid */}
      {displayedContracts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {displayedContracts
            .filter(Boolean) // Critical Null Guard
            .map((contract) => (
              <RequestCard
                key={contract.contractId || (contract as any)._id}
                contract={contract}
                isOutbox={activeTab === "outbox"}
                onActionComplete={fetchRequests}
              />
            ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            {activeTab === "inbox" ? (
              <Inbox className="w-8 h-8 text-gray-400" />
            ) : (
              <Send className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTab === "inbox" ? "No incoming requests" : "No sent requests"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            {activeTab === "inbox" 
              ? "When someone invites you to review a contract, it will appear here." 
              : "You haven't sent any contracts out for review yet."}
          </p>
        </div>
      )}
    </main>
  );
}