// app/(protected)/dashboard/mycontracts/[contractname]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Image from "next/image";

export default function ContractDetailsPage() {
  const { contractname } = useParams();

  // TEMPORARY: replace later with real API fetch
  const mock = {
    title: decodeURIComponent(contractname as string),
    company: "Apple Inc.",
    description:
      "This is a detailed contract description. Later we will fetch this from DB.",
    startDate: "Jan 15, 2024",
    endDate: "Dec 31, 2024",
    progress: 65,
  };

  return (
    <div className="w-full px-6 py-6">
      <h1 className="text-3xl font-bold">{mock.title}</h1>

      <p className="text-blue-600 mt-1">{mock.company}</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Contract Overview</h2>
          <p className="mt-2 text-gray-600">{mock.description}</p>

          <div className="mt-4 space-y-2">
            <p><strong>Start Date:</strong> {mock.startDate}</p>
            <p><strong>End Date:</strong> {mock.endDate}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Progress</h2>

          <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${mock.progress}%` }}
            ></div>
          </div>

          <p className="mt-2 text-sm text-gray-700">
            {mock.progress}% Completed
          </p>
        </div>
      </div>
    </div>
  );
}
