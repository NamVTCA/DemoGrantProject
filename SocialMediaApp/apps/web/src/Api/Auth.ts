// File: apps/web/src/Api/Auth.ts

import type { CreateUserDto, LoginResponse } from '../types/user';
import { api } from './api';

export const register = (dto: CreateUserDto) => {
  return api.post('/users/register', dto);
};

export const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  // ## SỬA LỖI CUỐI CÙNG Ở ĐÂY ##
  // Ép kiểu 2 bước: `as unknown as LoginResponse`
  // Báo cho TypeScript rằng chúng ta biết rõ kết quả trả về từ interceptor là LoginResponse.
  const data = (await api.post('/auth/login', credentials)) as unknown as LoginResponse;

  // Logic lưu token vào localStorage giờ sẽ hoạt động
  if (data?.access_token && data?.user?._id) {
    localStorage.setItem('token', data.access_token);
  } else {
    throw new Error('Phản hồi đăng nhập không hợp lệ.');
  }

  return data;
};

// --- CÁC HÀM API KHÁC GIỮ NGUYÊN ---
export const sendResetPasswordOtp = (email: string) => {
  return api.post('/auth/send-otp', { email });
};

export const verifyOtp = (email: string, otp: string) => {
  return api.post('/auth/verify-otp', { email, otp });
};

export const resetPassword = (email: string, resetToken: string, newPassword: string) => {
  return api.post('/auth/reset', { email, resetToken, newPassword });
};
