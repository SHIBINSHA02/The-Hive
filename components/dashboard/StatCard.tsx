// components/dashboard/StatCard.tsx
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
    return (
        <div className=
            "rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow bg-blue-50 duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{value}</p>
                    {trend && (
                        <p className=
                            "text-xs mt-1">
                            {trend.isPositive ? "+" : ""}{trend.value}% from last month
                        </p>
                    )}
                </div>
                <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>
        </div>
    );
}
