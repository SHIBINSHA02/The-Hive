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
}: ContractCardProps) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-accent";
    if (progress >= 50) return "bg-amber-500";
    return "bg-orange-500";
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-[#ffffff] shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      {/* Background Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={backgroundImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
        
        {/* Company Logo */}
        <div className="absolute bottom-0 left-4 translate-y-1/2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-card shadow-lg ring-4 ring-card">
            <img
              src={companyLogo}
              alt={companyName}
              className="h-10 w-10 rounded-lg object-contain"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-10">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {companyName}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-foreground line-clamp-1">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Dates */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{startDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{deadline}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
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