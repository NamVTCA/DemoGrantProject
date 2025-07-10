// File: apps/web/src/Api/notificationApi.ts

import { api } from './api';

export const notificationApi = {
  /**
   * Lấy tất cả thông báo của người dùng
   */
  getNotifications: () => {
    return api.get('api/notifications');
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: () => {
    return api.get('api/notifications/unread-count');
  },

  /**
   * Đánh dấu một thông báo là đã đọc
   * @param id ID của thông báo
   */
  markAsRead: (id: string) => {
    return api.patch(`api/notifications/read/${id}`);
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: () => {
    return api.patch('api/notifications/read/all');
  },
};