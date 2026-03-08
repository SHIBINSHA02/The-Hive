"use client";

import { useState } from "react";
import { Calendar, Clock, Download, Loader2 } from "lucide-react";

interface ContractCardProps {
  id: string; // ⬅️ NEW: Required to fetch the specific contract
  companyName: string;
  companyLogo: string;
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  progress: number;
  backgroundImage: string;
  viewerRole?: "client" | "contractor" | "owner";
  counterpartyName?: string;
}

const ContractCard = ({
  id,
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
  const [isDownloading, setIsDownloading] = useState(false);

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-blue-600";
    if (progress >= 50) return "bg-blue-500";
    return "bg-blue-400";
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents navigating to the detail page
    e.stopPropagation(); // Stops the click from bubbling up to the card

    if (isDownloading) return;

    setIsDownloading(true);
    try {
      // 1. Call the new GET route we just built to fetch the saved text
      const response = await fetch(`/api/contract/generate-pdf?contractId=${id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to fetch contract data");

      const { fullText, title } = data;

      // 2. Recreate the exact same print layout used in PreviewPage
      const element = document.createElement("div");
      element.innerHTML = `
        <div style="font-family: 'Times New Roman', serif; padding: 50px; line-height: 1.6; color: black; background: white;">
          <h1 style="text-align: center; text-transform: uppercase; margin-bottom: 30px;">${title}</h1>
          <div style="white-space: pre-wrap;">${fullText}</div>
        </div>
      `;

      // 3. Exact same html2pdf configuration for 1:1 identical output
      const opt = {
        margin: 0.75,
        filename: `${title.replace(/\s+/g, "_")}_Dashboard.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      // 4. Generate and trigger download
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();

    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download the contract. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      
      {/* ⬅️ NEW: Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="absolute top-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
        title="Download PDF"
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        ) : (
          <Download className="h-4 w-4 text-gray-700 hover:text-blue-600" />
        )}
      </button>

      {/* Background Image */}
      <div className="relative h-28 sm:h-32 overflow-hidden">
        {backgroundImage && backgroundImage.trim() !== "" ? (
          <img
            src={backgroundImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-slate-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Company Logo */}
      <div className="absolute top-25 left-4 z-40 bg-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-card shadow-lg ring-4 ring-card">
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
                  : viewerRole === "owner"
                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              You: <span className="ml-1 capitalize">{viewerRole}</span>
            </span>
            {counterpartyName && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                With: <span className="ml-1 max-w-[150px] truncate">{counterpartyName}</span>
              </span>
            )}
          </div>
        )}

        <h3 className="mt-1 line-clamp-1 text-base sm:text-lg font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm sm:text-[15px] text-gray-500">
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