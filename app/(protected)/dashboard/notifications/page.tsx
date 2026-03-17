// app/(protected)/dashboard/notifications/page.tsx
"use client"

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Notification, NotificationType } from "@/types/notification";
import NotificationHeader from './_components/NotificationHeader';
import NotificationStats from './_components/NotificationStats';
import NotificationFilters from './_components/NotificationFilters';
import NotificationList from './_components/NotificationList';
import { fetchAllNotifications } from './notificationService';


export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(fetchAllNotifications());
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/notifications');

      if (!res.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await res.json();
      setNotifications(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let result = notifications;

    // Apply type filter
    if (activeFilter !== 'all') {
      result = result.filter((n) => n.type === activeFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query) ||
          n.contractName?.toLowerCase().includes(query) ||
          n.contractId?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [notifications, activeFilter, searchQuery]);

  // Calculate counts for filters
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      request: notifications.filter((n) => n.type === 'request').length,
      alert: notifications.filter((n) => n.type === 'alert').length,
      payment: notifications.filter((n) => n.type === 'payment').length,
      update: notifications.filter((n) => n.type === 'update').length,
    };
  }, [notifications]);

  // Calculate stats
  const stats = useMemo(() => {
    const pendingRequests = notifications.filter(
      (n) => n.type === 'request' && n.status === 'pending'
    ).length;
    const activeAlerts = notifications.filter(
      (n) => n.type === 'alert' && n.status === 'pending'
    ).length;
    const pendingPayments = notifications.filter(
      (n) => n.type === 'payment' && (n.status === 'pending' || n.status === 'overdue')
    ).length;
    const totalAmount = notifications
      .filter((n) => n.type === 'payment' && n.amount)
      .reduce((sum, n) => sum + (n.amount || 0), 0);

    return { pendingRequests, activeAlerts, pendingPayments, totalAmount };
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, isRead: true }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleAction = (notificationId: string, action: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || !notification.contractId) return;

    // Mark as read immediately upon clicking
    if (!notification.isRead) {
      handleMarkRead(notificationId);
    }

    // Route the user based on the notification type
    // If it is a "request" (meaning someone sent it to them), route them to the Requests view.
    // Otherwise, route them to their My Contracts view.
    if (notification.type === 'request' || action === 'review' || action === 'sign') {
      router.push(`/dashboard/requests/${encodeURIComponent(notification.contractId)}`);
    } else {
      router.push(`/dashboard/mycontracts/${encodeURIComponent(notification.contractId)}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-lg font-medium text-destructive">Error loading notifications</p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => fetchNotifications()}
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <NotificationHeader
          unreadCount={unreadCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMarkAllRead={handleMarkAllRead}
        />

        <NotificationStats
          pendingRequests={stats.pendingRequests}
          activeAlerts={stats.activeAlerts}
          pendingPayments={stats.pendingPayments}
          totalAmount={stats.totalAmount}
        />

        <NotificationFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />

        <NotificationList
          notifications={filteredNotifications}
          onAction={handleAction}
          onMarkRead={handleMarkRead}
        />
      </div>
    </div>
  );
};

