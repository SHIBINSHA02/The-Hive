// app/(protected)/dashboard/mycontracts/[contractname]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Contract } from "@/types/contract";
export default function ContractDetailsPage() {
  const { contractname } = useParams(); // <-- contains contractId
  const contractId = decodeURIComponent(contractname as string);

  

const [data, setData] = useState<Contract | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!contractId) return;

    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/contracts/${contractId}`, {
          method: "GET",
          cache: "no-store"
        });

        if (!res.ok) throw new Error("Failed to fetch contract");

        const json:Contract = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  if (loading)
    return (
      <div className="p-6">
        <p className="text-lg font-semibold">Loading contract…</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-red-600">
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
      </div>
    );

  if (!data)
    return (
      <div className="p-6">
        <p>No contract found</p>
      </div>
    );

  return (
    <div className="w-full lg:px-6 px-0 lg:py-6 py-0 space-y-6 ">
      {/* Header */}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow">
        {data.bgImageUrl && (
          <Image
            src={data.bgImageUrl}
            alt="Background"
            fill
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-black/40 flex items-end p-6 text-white">
          <div>
            <h1 className="text-3xl font-bold">{data.contractTitle}</h1>
            <div className="flex items-center gap-3 mt-2">
              {data.companyLogoUrl && (
                <Image
                  src={data.companyLogoUrl}
                  alt={data.companyName}
                  width={38}
                  height={38}
                  className="rounded"
                />
              )}
              <span className="text-lg">{data.companyName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Summary</h2>
          <p className="mt-2 text-gray-700 whitespace-pre-line">
            {data.summary}
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>Start Date:</strong>{" "}
              {new Date(data.startDate).toDateString()}
            </p>
            <p>
              <strong>Deadline:</strong>{" "}
              {new Date(data.deadline).toDateString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="capitalize">{data.contractStatus}</span>
            </p>
            <p>
              <strong>Contract ID:</strong> {data.contractId}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Progress</h2>

          <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${data.progress}%` }}
            ></div>
          </div>

          <p className="mt-2 text-sm text-gray-700">
            {data.progress}% Completed
          </p>

          {/* Keypoints */}
          <div className="mt-4">
            <h3 className="font-semibold">Key Points</h3>
            <ul className="list-disc ml-6 mt-2 text-sm text-gray-700">
              {data.keypoints?.map((k: string, idx: number) => (
                <li key={idx}>{k}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Clauses */}
      <div className="rounded-xl border bg-white p-5 shadow">
        <h2 className="font-semibold text-lg">Clauses</h2>
        <ul className="list-disc ml-6 mt-2 text-gray-700">
          {data.clauses?.map((c: string, idx: number) => (
            <li key={idx}>{c}</li>
          ))}
        </ul>
      </div>

      {/* Full Contract */}
      <div className="rounded-xl border bg-white p-5 shadow">
      <h2 className="font-semibold text-lg">Contract Document</h2>

      <div className="prose max-w-none mt-3">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {data.contractContent}
        </ReactMarkdown>
      </div>
    </div>
    </div>
  );
}
