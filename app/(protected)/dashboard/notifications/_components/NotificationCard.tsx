// app/(protected)/dashboard/notifications/_components/NotificationCard.tsx
import { Notification, NotificationPriority, NotificationStatus } from '@/types/notification';
import {
  FileText,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  Clock,
  CircleDot,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  notification: Notification;
  onAction: (notificationId: string, action: string) => void;
  onMarkRead: (notificationId: string) => void;
}

const NotificationCard = ({ notification, onMarkRead }: NotificationCardProps) => {
  const getTypeIcon = () => {
    const iconClass = 'h-5 w-5';
    switch (notification.type) {
      case 'request':
        return <FileText className={`${iconClass} text-info`} />;
      case 'alert':
        return <AlertTriangle className={`${iconClass} text-pending`} />;
      case 'payment':
        return <CreditCard className={`${iconClass} text-success`} />;
      case 'update':
        return <RefreshCw className={`${iconClass} text-muted-foreground`} />;
    }
  };

  const getPriorityStyles = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'status-urgent';
      case 'high':
        return 'status-pending';
      case 'medium':
        return 'status-info';
      case 'low':
        return 'status-success';
    }
  };

  const getStatusStyles = (status: NotificationStatus) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
      case 'completed':
        return 'status-success';
      case 'rejected':
      case 'overdue':
        return 'status-urgent';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

  return (
    <div
      className={`notification-card animate-slide-in ${
        !notification.isRead ? 'notification-unread' : ''
      }`}
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
    >
      <div className="flex gap-4">
        
        {/* Only icon now */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          {getTypeIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {!notification.isRead && (
                <CircleDot className="h-3 w-3 text-info flex-shrink-0" />
              )}
              <h3 className="font-medium text-foreground">{notification.title}</h3>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`status-badge ${getPriorityStyles(notification.priority)}`}>
                {notification.priority}
              </span>
              <span className={`status-badge ${getStatusStyles(notification.status)}`}>
                {notification.status}
              </span>
            </div>
          </div>

          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {notification.description}
          </p>

          {notification.contractName && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                {notification.contractId}
              </span>

              {notification.amount && (
                <span className="font-semibold text-foreground">
                  {formatAmount(notification.amount)}
                </span>
              )}

              {notification.dueDate && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Due: {new Date(notification.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>

            {/* Actions + Buttons removed completely */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
