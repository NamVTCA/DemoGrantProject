// File: apps/web/src/contexts/NotificationContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuthContext } from '../Context/AuthContext';
import { useSocket } from '../Context/SocketContext';
import { notificationApi } from '../Api/notificationApi';

// Định nghĩa kiểu dữ liệu cho object đếm để code an toàn hơn
interface UnreadCountResponse {
  count: number;
}

interface INotificationContext {
  notifications: any[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<INotificationContext | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { authUser } = useAuthContext();
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchInitialData = useCallback(async () => {
    if (!authUser) return;
    try {
      const countResponse = (await notificationApi.getUnreadCount()) as unknown as UnreadCountResponse;
      const notifsResponse = (await notificationApi.getNotifications()) as unknown as any[];
      
      setUnreadCount(countResponse?.count || 0); // Thêm ?. để an toàn hơn
      setNotifications(notifsResponse || []);

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thông báo:", error);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      fetchInitialData();
    }
  }, [authUser, fetchInitialData]);

  // Lắng nghe sự kiện real-time từ server
  useEffect(() => {
    // ## SỬA LỖI Ở ĐÂY ##
    // Thêm một lớp kiểm tra để đảm bảo socket không phải là null trước khi sử dụng
    if (!socket) {
      return; // Nếu chưa có socket, không làm gì cả và thoát ra
    }

    const handleNewNotification = (newNotification: any) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);

    // Dọn dẹp listener khi component unmount hoặc socket thay đổi
    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]); // Chỉ chạy lại khi socket thay đổi

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
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

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}