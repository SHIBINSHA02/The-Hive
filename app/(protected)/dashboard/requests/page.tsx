// app/(protected)/dashboard/requests/page.tsx
'use client';

import React from 'react';
import RequestCard from './_components/RequestCard';
import { mockContracts } from './_components/mockContracts';

export default function RequestsPage() {
  return (
    <main className="p-6">

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Requests Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage incoming contract requests
        </p>
      </div>

      {/* Request Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockContracts.map((contract) => (
          <RequestCard
            key={contract._id}
            contract={contract}
          />
        ))}
      </div>

    </main>
  );
}
