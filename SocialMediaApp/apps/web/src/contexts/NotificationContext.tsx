// File: NotificationContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuthContext } from '../Context/AuthContext';
import { useSocket } from '../Context/SocketContext';
import { notificationApi } from '../Api/notificationApi';

interface UnreadCountResponse {
  count: number;
}

interface INotificationContext {
  notifications: any[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAllAsRead: () => Promise<void>;
}

export const NotificationContext = createContext<INotificationContext | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { authUser } = useAuthContext();
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchInitialData = useCallback(async () => {
    if (!authUser) return;
    try {
      const countResponse = (await notificationApi.getUnreadCount()).data as UnreadCountResponse;
      const notifsResponse = (await notificationApi.getNotifications()).data as any[];

      setUnreadCount(countResponse?.count || 0);
      setNotifications(notifsResponse || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thông báo:', error);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      fetchInitialData();
    }
  }, [authUser, fetchInitialData]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotification: any) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);
    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    fetchNotifications: fetchInitialData,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
