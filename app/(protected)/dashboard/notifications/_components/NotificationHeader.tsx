// app/(protected)/dashboard/notifications/_components/NotificationHeader.tsx
import { Bell, Search, Settings, Check } from 'lucide-react';

interface NotificationHeaderProps {
  unreadCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMarkAllRead: () => void;
}

const NotificationHeader = ({
  unreadCount,
  searchQuery,
  onSearchChange,
  onMarkAllRead,
}: NotificationHeaderProps) => {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Title */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Bell className="h-6 w-6 text-primary-foreground" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? (
                <>You have <span className="font-medium text-info">{unreadCount} unread</span> notifications</>
              ) : (
                'All caught up!'
              )}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          
          {/* Search */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-card border border-border rounded-md h-9 w-full outline-none"
            />
          </div>

          {/* Mark All Read */}
          <div
            onClick={onMarkAllRead}
            className="hidden sm:flex items-center gap-2 border border-border rounded-md px-3 py-1.5 cursor-pointer hover:bg-muted transition"
          >
            <Check className="h-4 w-4" />
            <span className="text-sm">Mark all read</span>
          </div>

          {/* Settings Icon */}
          <div
            className="h-9 w-9 flex items-center justify-center rounded-md cursor-pointer hover:bg-muted text-muted-foreground transition"
          >
            <Settings className="h-5 w-5" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotificationHeader;
