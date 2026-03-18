type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

let notifications: Notification[] = [];

export const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString();
  const fullNotification: Notification = {
    id,
    duration: notification.duration || 5000,
    ...notification
  };
  
  notifications.push(fullNotification);
  
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('notification', {
      detail: fullNotification
    });
    window.dispatchEvent(event);
  }
};

export const getAndClearNotifications = (): Notification[] => {
  const currentNotifications = [...notifications];
  notifications = [];
  return currentNotifications;
};

export type { Notification, NotificationType };
