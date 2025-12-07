// components/dashboard/RowContractCard.tsx
"use client";

interface ContractCardProps {
  companyName: string;
  companyLogo: string;
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  progress: number;
}

// 🎯 NEW: Circular Progress Bar Component using SVG
const CircularProgressBar = ({ progress }: { progress: number }) => {
  const radius = 20; // Radius of the circle
  const circumference = 2 * Math.PI * radius;
  // Calculation to determine how much of the stroke is filled
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determine color for the progress stroke
  const strokeColor = progress === 100 ? "stroke-green-500" : "stroke-blue-500";

  return (
    <div className="relative w-14 h-14">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Circle (The track) */}
        <circle
          className="text-gray-200"
          strokeWidth="4"
          fill="transparent"
          r={radius}
          cx="28"
          cy="28"
        />

        {/* Progress Circle (The filled part) */}
        <circle
          className={`${strokeColor} transition-all duration-500`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" // Makes the end of the line rounded
          fill="transparent"
          r={radius}
          cx="28"
          cy="28"
        />
      </svg>

      {/* Centered Percentage Text */}
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
        {progress}%
      </span>
    </div>
  );
};


export const RowContractCard = (
  {
    companyName,
    companyLogo,
    title,
    description,
    startDate,
    deadline,
    progress,

  }: ContractCardProps
) => {

  return (
    // Main Card Container
    <div className="w-full bg-white p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition duration-300 ease-in-out">

      <div className="flex justify-between items-start mb-4">

        {/* Contract Title and Description */}
        <div className="max-w-[70%]">
          <h1 className="text-xl font-semibold text-gray-800 truncate mb-1">
            {title}
          </h1>
          <p className="text-sm text-blue-800 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Progress Indicator (Moved to Top Right) */}
        <div className="flex-shrink-0">
          <CircularProgressBar progress={progress} />
        </div>
      </div>


      {/* Footer: Company Info and Dates */}
      <div className="flex justify-between items-center border-t pt-4">

        {/* Company Info */}
        <div className="flex items-center space-x-3">
          <div className="border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              className="h-full w-full object-contain p-0.5"
              src={companyLogo}
              alt={`${companyName} logo`}
            />
          </div>
          <h2 className="text-sm font-medium text-gray-600">
            {companyName}
          </h2>
        </div>


        {/* Date Group */}
        <div className="flex space-x-4 text-xs font-medium">
          <div className="text-gray-500 text-right">
            <span className="block font-normal">Start Date</span>
            <span className="text-gray-800">{startDate}</span>
          </div>
          <div className="text-gray-500 text-right">
            <span className="block font-normal">Deadline</span>
            <span className="text-blue-500 font-semibold">{deadline}</span>
          </div>
        </div>

      </div>
    </div>

  );
};