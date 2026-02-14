// app/(protected)/dashboard/notifications/_components/NotificationFilters.tsx
import { NotificationType } from '@/types/notification';
import { FileText, AlertTriangle, CreditCard, RefreshCw } from 'lucide-react';

interface FilterOption {
  id: NotificationType | 'all';
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface NotificationFiltersProps {
  activeFilter: NotificationType | 'all';
  onFilterChange: (filter: NotificationType | 'all') => void;
  counts: Record<NotificationType | 'all', number>;
}

const NotificationFilters = ({
  activeFilter,
  onFilterChange,
  counts,
}: NotificationFiltersProps) => {
  const filters: FilterOption[] = [
    { id: 'all', label: 'All', icon: null, count: counts.all },
    { id: 'request', label: 'Requests', icon: <FileText className="h-4 w-4" />, count: counts.request },
    { id: 'alert', label: 'Alerts', icon: <AlertTriangle className="h-4 w-4" />, count: counts.alert },
    { id: 'payment', label: 'Payments', icon: <CreditCard className="h-4 w-4" />, count: counts.payment },
    { id: 'update', label: 'Updates', icon: <RefreshCw className="h-4 w-4" />, count: counts.update },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2 animate-fade-in">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`filter-tab flex items-center gap-2 ${
            activeFilter === filter.id ? 'filter-tab-active' : 'filter-tab-inactive'
          }`}
        >
          {filter.icon}
          <span>{filter.label}</span>
          {filter.count !== undefined && filter.count > 0 && (
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                activeFilter === filter.id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default NotificationFilters;