// types/notification.ts
export type NotificationType = 'request' | 'alert' | 'payment' | 'update';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'overdue';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  contractName?: string;
  contractId?: string;
  amount?: number;
  dueDate?: string;
  sender?: string;
  senderAvatar?: string;
  timestamp: string;
  isRead: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  type: 'primary' | 'secondary' | 'destructive';
  action: string;
}
