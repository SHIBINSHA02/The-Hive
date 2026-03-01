//app/(protected)/dashboard/notifications/notificationService.ts


import { mockNotifications } from "./_components/mockNotifications";

export function fetchAllNotifications() {
    return mockNotifications
}

export function getDaysLeft(dueDate: string | Date) {
  const today = new Date();
  const due = new Date(dueDate);

  const diffInMs = due.getTime() - today.getTime();
  const msInDay = 1000 * 60 * 60 * 24;

  return Math.ceil(diffInMs / msInDay);
}

export function contractsNeedingRemainder() {
    return mockNotifications.filter(
        (n) => {
            const daysleft=getDaysLeft(n.dueDate);
            return daysleft<=5 && daysleft>=0;
        }
    );
}