'use client';

import { useState, useEffect } from 'react';
import { Notification, getAndClearNotifications } from '@/lib/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNotification = (event: any) => {
      const newNotification = event.detail as Notification;
      setNotifications(prev => [...prev, newNotification]);
    };

    window.addEventListener('notification', handleNotification);

    return () => {
      window.removeEventListener('notification', handleNotification);
    };
  }, []);

  return {
    notifications,
    clearNotifications: getAndClearNotifications
  };
}
