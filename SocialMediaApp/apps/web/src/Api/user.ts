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
  return api.get(`/users/profile/${userId}`); // Endpoint này cần được tạo ở backend
};

// API cho chức năng kết bạn (đã có sẵn)
export const sendFriendRequest = (userId: string) => {
  return api.post(`/users/friend/request/${userId}`);
};

// API cho chức năng Follow
export const followUser = (userId: string) => {
  return api.post(`/follow/${userId}`);
};

export const unfollowUser = (userId: string) => {
  return api.delete(`/follow/${userId}`);
};