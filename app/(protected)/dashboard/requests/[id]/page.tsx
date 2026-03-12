"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle, Loader2 } from "lucide-react";
import { Contract } from "@/types/contract";

export default function RequestContractDetailsPage() {
  const { id } = useParams();
  const contractId = decodeURIComponent(id as string);

  const [data, setData] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContract() {
      try {
        const res = await fetch(`/api/contracts/${contractId}`);
        if (!res.ok) throw new Error("Contract not found or access denied");
        
        const json = await res.json();
        // The API returns { contract, finance, role }
        setData(json.contract);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContract();
  }, [contractId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        {error || "No contract found"}
      </div>
    );
  }

  return (
    <div className="w-full lg:px-6 px-0 lg:py-6 py-0 space-y-6">

      {/* Header */}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow">
        {data.bgImageUrl && (
          <Image
            src={data.bgImageUrl}
            alt="Contract background"
            fill
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-black/40 flex items-end p-6 text-white">
          <div>
            <h1 className="text-3xl font-bold">
              {data.contractTitle}
            </h1>

            <div className="flex items-center gap-3 mt-2">
              {data.companyLogoUrl && (
                <Image
                  src={data.companyLogoUrl}
                  alt={data.companyName}
                  width={38}
                  height={38}
                  className="rounded bg-white p-1"
                />
              )}
              <span className="text-lg">{data.companyName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Summary</h2>

          <p className="mt-2 text-gray-700 whitespace-pre-line">
            {data.summary || data.description || "—"}
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

        {/* Progress */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Progress</h2>

          <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${data.progress}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-gray-700">
            {data.progress}% Completed
          </p>

          {data.keypoints?.length && (
            <div className="mt-4">
              <h3 className="font-semibold">Key Points</h3>
              <ul className="list-disc ml-6 mt-2 text-sm text-gray-700">
                {data.keypoints.map((k, idx) => (
                  <li key={idx}>{k}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Clauses */}
      {data.clauses?.length && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
          <h2 className="font-semibold text-lg">Clauses</h2>
          <ul className="list-disc ml-6 mt-2 text-gray-700">
            {data.clauses.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Full Contract */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-lg">Contract Document</h2>

        <div className="prose max-w-none mt-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.contractContent}
          </ReactMarkdown>
        </div>
      </div>

      {/* Approve */}
      {data.contractStatus === "pending" && (
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all">
            <CheckCircle className="w-5 h-5" />
            Approve Contract
          </button>
        </div>
      )}
    </div>
  );
}
