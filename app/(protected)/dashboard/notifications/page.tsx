// app/(protected)/dashboard/notifications/page.tsx
"use client"

import { useState, useMemo } from 'react';
import { Notification, NotificationType } from "@/types/notification";
import { mockNotifications } from './_components/mockNotifications';
import NotificationHeader from './_components/NotificationHeader';
import NotificationStats from './_components/NotificationStats';
import NotificationFilters from './_components/NotificationFilters';
import NotificationList from './_components/NotificationList';



export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('')
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

  const handleMarkRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    
  };

  const handleAction = (notificationId: string, action: string) => {
    
    // In a real app, this would trigger the appropriate action
  };

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

