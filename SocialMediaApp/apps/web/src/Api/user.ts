// File: apps/web/src/Api/user.ts

import type { UpdateUserDto } from '../types/user';
import { api } from './api'; // <-- Import instance api tập trung

// === API cho trang profile của chính mình ===
export const getMyProfile = () => {
  return api.get('/users/me');
};

export const updateProfile = (data: Partial<UpdateUserDto>) => {
  return api.patch('/users/me/update', data);
};

export const setInterests = (ids: string[]) => {
  return api.post('/users/set/interests', { interestIds: ids });
};


// === API cho trang profile của người khác ===

// Lấy thông tin profile và các trạng thái liên quan
export const getUserProfile = (userId: string) => {
  return api.get(`/users/profile/${userId}`);
};


// === API CHO CHỨC NĂNG BẠN BÈ ===

/**
 * ## HÀM MỚI ĐƯỢC THÊM VÀO ##
 * Lấy danh sách bạn bè của người dùng hiện tại.
 * Gọi đến đúng đường dẫn `/users/friend/list`.
 */
export const getAllFriends = () => {
    return api.get('/users/friend/list');
};

// Gửi yêu cầu kết bạn
export const sendFriendRequest = (userId: string) => {
  return api.post(`/users/friend/request/${userId}`);
};


// === API CHO CHỨC NĂNG FOLLOW ===

export const followUser = (userId: string) => {
  return api.post(`/follow/${userId}`);
};

export const unfollowUser = (userId: string) => {
  return api.delete(`/follow/${userId}`);
};