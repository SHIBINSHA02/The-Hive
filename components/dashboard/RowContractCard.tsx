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

const CircularProgressBar = ({ progress }: { progress: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const strokeColor = progress === 100 ? "stroke-green-500" : "stroke-blue-500";

  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-gray-200"
          strokeWidth="4"
          fill="transparent"
          r={radius}
          cx="28"
          cy="28"
        />
        <circle
          className={`${strokeColor} transition-all duration-500`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="28"
          cy="28"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-700">
        {progress}%
      </span>
    </div>
  );
};

export const RowContractCard = ({
  companyName,
  companyLogo,
  title,
  description,
  startDate,
  deadline,
  progress,
}: ContractCardProps) => {
  return (
    <div className="w-full bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition duration-300">

      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        
        {/* Title + Description */}
        <div className="w-full sm:max-w-[75%]">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate mb-1">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-blue-800 line-clamp-3 sm:line-clamp-2">
            {description}
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-start sm:justify-end">
          <CircularProgressBar progress={progress} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-4 gap-3">

        {/* Company */}
        <div className="flex items-center space-x-3">
          <div className="border border-gray-200 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden">
            <img
              className="h-full w-full object-contain p-0.5"
              src={companyLogo}
              alt={`${companyName} logo`}
            />
          </div>
          <h2 className="text-sm sm:text-base font-medium text-gray-600">
            {companyName}
          </h2>
        </div>

        {/* Dates */}
        <div className="flex justify-between sm:justify-end gap-6 text-xs sm:text-sm font-medium">
          <div className="text-gray-500 text-right">
            <span className="block font-normal">Start</span>
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
