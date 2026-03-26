// app/(protected)/dashboard/requests/_components/RequestCard.tsx
'use client';

import React from 'react';
import { 
  Calendar, 
  Clock, 
  Eye, 
  X, 
  Loader2, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';
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

  const getRedirectPath = (contract: Contract) => {
    const status = contract.contractStatus;
    const id = contract._id || contract.contractId;
    if (status === "draft") return `/dashboard/mycontracts/draft/${id}`;
    if (["sent_for_review", "in_negotiation", "locked"].includes(status)) 
      return `/dashboard/mycontracts/negotiate/${id}`;
    if (status === "active") return `/dashboard/mycontracts/onprogress/${id}`;
    return `/dashboard/mycontracts/other/${id}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'In Progress',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          dotColor: 'bg-emerald-500'
        };
      case 'in_negotiation':
      case 'sent_for_review':
        return {
          label: 'Negotiating',
          icon: <Sparkles className="w-3.5 h-3.5" />,
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          dotColor: 'bg-amber-500'
        };
      case 'locked':
        return {
          label: 'Locked',
          icon: <Lock className="w-3.5 h-3.5" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          dotColor: 'bg-blue-500'
        };
      case 'draft':
        return {
          label: 'Draft',
          icon: <FileText className="w-3.5 h-3.5" />,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          dotColor: 'bg-gray-400'
        };
      default:
        return {
          label: status.replace(/_/g, ' '),
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          dotColor: 'bg-red-500'
        };
    }
  };

  const statusConfig = getStatusConfig(contract.contractStatus || 'unknown');
  
  // Logic for "Waiting for Action"
  const isUserTurn = contract.currentTurn && contract.viewerRole && contract.currentTurn === contract.viewerRole;
  const showActionRequired = isUserTurn && ['in_negotiation', 'sent_for_review'].includes(contract.contractStatus);

  const handleNavigate = () => {
    router.push(getRedirectPath(contract));
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to cancel this request?")) return;
    
    try {
      setIsCancelling(true);
      const res = await fetch(`/api/contracts/${contract?._id || contract?.contractId}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel request");
      onActionComplete?.();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div 
      onClick={handleNavigate}
      className="group relative flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 cursor-pointer overflow-hidden"
    >
      {/* Action Required Badge */}
      {showActionRequired && (
        <div className="absolute top-3 left-3 z-50 animate-bounce">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-lg uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Your Turn
          </div>
        </div>
      )}

      {/* Header Visual */}
      <div className="relative h-28 overflow-hidden">
        {contract?.bgImageUrl ? (
          <Image
            src={contract.bgImageUrl}
            alt={contract.contractTitle || "Contract"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Company Logo Overlay */}
        <div className="absolute -bottom-6 left-4 transition-transform duration-300 group-hover:scale-110">
          <div className="w-14 h-14 rounded-xl bg-white shadow-lg p-2.5 flex items-center justify-center border border-gray-100">
            {contract?.companyLogoUrl ? (
              <img
                src={contract.companyLogoUrl}
                alt={contract.companyName}
                className="w-full h-full object-contain"
              />
            ) : (
              <FileText className="w-6 h-6 text-blue-500" />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 pt-8 flex flex-col">
        {/* Status & Category */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-blue-600 truncate max-w-[120px]">
            {contract?.companyName}
          </span>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} text-[10px] font-bold uppercase tracking-wider`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
            {statusConfig.label}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {contract?.contractTitle}
        </h3>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {contract.summary || contract.description || 'No description available for this contract request.'}
        </p>

        {/* Info Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 px-3 py-2 rounded-xl bg-gray-50/50 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start Date</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              {contract?.startDate ? new Date(contract.startDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div className="flex flex-col gap-1 px-3 py-2 rounded-xl bg-gray-50/50 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deadline</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              {contract?.deadline ? new Date(contract.deadline).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-gray-700">Completion</span>
            <span className="text-xs font-extrabold text-blue-600">{contract.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${contract.progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <Eye className="w-4 h-4" />
            View Details
            <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </button>

          {isOutbox && contract?.contractStatus && ["draft", "sent_for_review", "in_negotiation"].includes(contract.contractStatus) && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50 active:scale-95"
              title={contract.contractStatus === "draft" ? "Discard Draft" : "Cancel Request"}
            >
              {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
