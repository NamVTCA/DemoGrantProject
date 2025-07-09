// File: apps/web/src/Api/userApi.ts
import { api } from './api';

export const userApi = {
  /**
   * Lấy thông tin của người dùng đã đăng nhập
   */
  getMe: () => {
    return api.get('/users/me');
  },

  /**
   * Lấy danh sách bạn bè (đường dẫn đúng là /users/friend/list)
   */
  getAllFriends: () => {
    return api.get('/users/friend/list');
  },

  // Thêm các hàm khác như gửi yêu cầu kết bạn, tìm kiếm user sau này
};