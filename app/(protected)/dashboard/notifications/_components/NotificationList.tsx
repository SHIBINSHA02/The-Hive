// app/(protected)/dashboard/notifications/_components/NotificationList.tsx
import { Notification } from '@/types/notification';
import NotificationCard from './NotificationCard';
import { Inbox } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  onAction: (notificationId: string, action: string) => void;
  onMarkRead: (notificationId: string) => void;
}

const NotificationList = ({ notifications, onAction, onMarkRead }: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">No notifications</h3>
        <p className="mt-1 text-sm text-muted-foreground text-blue-700">
          You're all caught up! Check back later for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <NotificationCard
            notification={notification}
            onAction={onAction}
            onMarkRead={onMarkRead}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
