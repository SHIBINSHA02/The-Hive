// app/(protected)/dashboard/requests/_components/RequestCard.tsx
'use client';

import React from 'react';
import { Calendar, Clock, Eye, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Contract } from '@/types/contract';

interface RequestCardProps {
  contract: Contract;
  isOutbox?: boolean;
  onActionComplete?: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ contract, isOutbox, onActionComplete }) => {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = React.useState(false);

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-blue-600';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-blue-400';
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to cancel this request?")) return;
    
    try {
      setIsCancelling(true);
      const res = await fetch(`/api/contracts/${contract.contractId}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel request");
      onActionComplete?.();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-card border border-gray-100 flex flex-col h-full ">

      {/* Background Image */}
      <div className="relative h-28 overflow-hidden">
        {contract.bgImageUrl && (
          <Image
            src={contract.bgImageUrl}
            alt={contract.contractTitle}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">

        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-blue-600">
            {contract.companyName}
          </span>

          <span className="text-xs capitalize text-gray-600">
            {contract.contractStatus.replace(/_/g, " ")}
          </span>
        </div>

        <h3 className="mt-2 font-bold text-gray-900">
          {contract.contractTitle}
        </h3>

        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {contract.summary || contract.description || '—'}
        </p>

        {/* Dates */}
        <div className="mt-3 flex gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            {new Date(contract.startDate).toDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange-500" />
            {new Date(contract.deadline).toDateString()}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Completion</span>
            <span>{contract.progress}%</span>
          </div>

          <div className="h-2 rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${getProgressColor(
                contract.progress
              )}`}
              style={{ width: `${contract.progress}%` }}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex gap-2">
            <button
            onClick={() =>
                router.push(`/dashboard/requests/${contract.contractId}`)
            }
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
            >
            <Eye className="w-4 h-4" />
            View
            </button>

            {isOutbox && ["draft", "sent_for_review", "in_negotiation"].includes(contract.contractStatus) && (
                <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50"
                    title={contract.contractStatus === "draft" ? "Discard Draft" : "Cancel Request"}
                >
                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
