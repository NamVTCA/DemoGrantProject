// File: apps/web/src/Api/notificationApi.ts

import { api } from './api';

export const notificationApi = {
  /**
   * Lấy tất cả thông báo của người dùng
   */
  getNotifications: () => {
    return api.get('/notifications');
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: () => {
    return api.get('/notifications/unread-count');
  },

  /**
   * Đánh dấu một thông báo là đã đọc
   * @param id ID của thông báo
   */
  markAsRead: (id: string) => {
    return api.patch(`/notifications/read/${id}`);
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: () => {
    return api.patch('/notifications/read/all');
  },
};