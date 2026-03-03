// components/dashboard/ContractCard.tsx
import { Calendar, Clock } from "lucide-react";

interface ContractCardProps {
  companyName: string;
  companyLogo: string;
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  progress: number;
  backgroundImage: string;
  viewerRole?: "client" | "contractor";
  counterpartyName?: string;
}

const ContractCard = ({
  companyName,
  companyLogo,
  title,
  description,
  startDate,
  deadline,
  progress,
  backgroundImage,
  viewerRole,
  counterpartyName,
}: ContractCardProps) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-blue-600";
    if (progress >= 50) return "bg-blue-500";
    return "bg-blue-400";
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">

  {/* Background Image */}
  <div className="relative h-28 sm:h-32 overflow-hidden">
    {/* Stricter check: Must exist AND must have length */}
    {backgroundImage && backgroundImage.trim() !== "" ? (
      <img
        src={backgroundImage}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    ) : (
      <div className="h-full w-full bg-slate-200" /> // Fallback background color
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
  </div>

  {/* Company Logo */}
      <div className="absolute top-25 left-4 z-40 bg-white">
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-card shadow-lg ring-4 ring-card">
      {/* Stricter check: Must exist AND must have length */}
      {companyLogo && companyLogo.trim() !== "" ? (
        <img
          src={companyLogo}
          alt={companyName || "Company"}
          className="h-10 w-10 rounded-lg object-contain"
        />
      ) : (
        <span className="text-gray-400 text-xs">No Logo</span>
      )}
    </div>
  </div>

  {/* Content */}
  <div className="px-4 pb-4 pt-10 sm:pt-12">
    <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-gray-500">
      {companyName}
    </p>

    {viewerRole && (
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
            viewerRole === "client"
              ? "bg-blue-50 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          You: <span className="ml-1 capitalize">{viewerRole}</span>
        </span>
        {counterpartyName && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
            With: <span className="ml-1 truncate max-w-[150px]">{counterpartyName}</span>
          </span>
        )}
      </div>
    )}

    <h3 className="mt-1 text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">
      {title}
    </h3>

    <p className="mt-2 text-sm sm:text-[15px] text-gray-500 line-clamp-2">
      {description}
    </p>

    {/* Dates */}
    <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4" />
        <span>{startDate}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        <span>{deadline}</span>
      </div>
    </div>

    {/* Progress */}
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-500">Progress</span>
        <span className="font-semibold text-gray-900">{progress}%</span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
</div>

  );
};

export default ContractCard;