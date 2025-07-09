import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface INotificationContext {
  unreadCounts: { [senderId: string]: number };
  markNotificationsAsRead: (senderId: string) => Promise<void>;
  socket: Socket;
}

// Kết nối socket với query chứa userId để xác thực trên gateway
const token = localStorage.getItem('token');
// Giả sử bạn parse token để lấy userId hoặc có sẵn trong localStorage
const userId = localStorage.getItem('userId');
const socket = io('http://localhost:9090', {
  query: { userId },
});

const NotificationContext = createContext<INotificationContext | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCounts, setUnreadCounts] = useState<{ [senderId: string]: number }>({});

  const fetchUnreadCounts = useCallback(async () => {
    if (!token) return;
    try {
      // Gọi API mới: /unread-by-sender
      const res = await fetch('http://localhost:9090/api/notifications/unread-by-sender', {
        headers: { Authorization: `Bearer ${token}` },
      });
    if (res.ok) {
      const data = await res.json();
      console.log("CONTEXT: Dữ liệu thông báo từ API:", data); 
      setUnreadCounts(data.counts || {});
    } else {
      console.error("CONTEXT: Lỗi khi gọi API, status:", res.status);
    }
    } catch (error) {
      console.error("Lỗi khi lấy thông báo chi tiết:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  useEffect(() => {
    const handleNewNotification = (data: { sender_id: string }) => {
      if (data.sender_id) {
        setUnreadCounts(prev => ({
          ...prev,
          [data.sender_id]: (prev[data.sender_id] || 0) + 1,
        }));
      }
    };
    socket.on('newNotification', handleNewNotification);
    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, []);

  const markNotificationsAsRead = async (senderId: string) => {
    if (!token || !unreadCounts[senderId]) return; // Chỉ gọi khi có tin nhắn chưa đọc
    try {
      // Gọi API mới: /mark-as-read
      await fetch('http://localhost:9090/api/notifications/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sender_id: senderId }),
      });
      // Cập nhật state ngay lập tức
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[senderId];
        return newCounts;
      });
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  const value = { unreadCounts, markNotificationsAsRead, socket };

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