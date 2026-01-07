// app/(protected)/dashboard/notifications/_components/NotificationStats.tsx
import { FileText, AlertTriangle, CreditCard, Clock } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  trendUp?: boolean;
}

const StatCard = ({ icon, label, value, trend, trendUp }: StatCardProps) => (
  <div className="rounded-xl bg-card border border-border p-4 transition-all duration-200 hover:shadow-md">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-semibold text-foreground">{value}</p>
          {trend && (
            <span
              className={`text-xs font-medium ${
                trendUp ? 'text-success' : 'text-urgent'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

interface NotificationStatsProps {
  pendingRequests: number;
  activeAlerts: number;
  pendingPayments: number;
  totalAmount: number;
}

const NotificationStats = ({
  pendingRequests,
  activeAlerts,
  pendingPayments,
  totalAmount,
}: NotificationStatsProps) => {
  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount}`;
  };

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-in">
      <StatCard
        icon={<FileText className="h-5 w-5 text-info" />}
        label="Pending Requests"
        value={pendingRequests}
      />
      <StatCard
        icon={<AlertTriangle className="h-5 w-5 text-pending" />}
        label="Active Alerts"
        value={activeAlerts}
      />
      <StatCard
        icon={<CreditCard className="h-5 w-5 text-success" />}
        label="Pending Payments"
        value={pendingPayments}
      />
      <StatCard
        icon={<Clock className="h-5 w-5 text-muted-foreground" />}
        label="Total Due"
        value={formatAmount(totalAmount)}
      />
    </div>
  );
};

export default NotificationStats;