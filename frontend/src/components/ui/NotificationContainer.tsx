'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { Tooltip } from './Tooltip';

export function NotificationContainer() {
  const { notifications } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Tooltip
          key={notification.id}
          message={notification.message}
          isVisible={true}
        />
      ))}
    </div>
  );
}
