import type { CreateUserDto } from '../types/user';
import { api } from './api';

// --- Định nghĩa kiểu dữ liệu cho các đối tượng ---

// Định nghĩa cấu trúc của đối tượng User trả về
interface AuthUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;       // Sửa: Thêm dấu '?' để cho biết trường này không bắt buộc
  interests: string[];  // Sửa: Sửa lỗi chính tả
  role: 'user' | 'admin' | 'moderator'; // Gợi ý: Thêm vai trò để dễ dàng phân quyền trên FE
}
// Định nghĩa cấu trúc cho toàn bộ response của API login
interface LoginResponse {
  access_token: string;
  user: AuthUser;
}


// --- Các hàm API ---

export const register = (dto: CreateUserDto) => {
  return api.post('/users/register', dto);
};

export const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  // Báo cho axios biết rằng kết quả trả về sẽ có dạng LoginResponse
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  const data = response.data;

  // Logic lưu vào localStorage sau khi đăng nhập thành công
  // Giờ đây TypeScript sẽ không báo lỗi nữa vì nó biết rõ cấu trúc của 'data'
  if (data?.access_token && data?.user?._id) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('userId', data.user._id);
    localStorage.setItem('user', JSON.stringify(data.user));
  } else {
    // Ném lỗi nếu dữ liệu trả về không như mong đợi
    throw new Error('Phản hồi đăng nhập không hợp lệ.');
  }

  return data;
};

export const sendResetPasswordOtp = (email: string) => {
  return api.post('/auth/send-otp', { email });
};

export const verifyOtp = (email: string, otp: string) => {
  return api.post('/auth/verify-otp', { email, otp });
};

export const resetPassword = (email: string, resetToken: string, newPassword: string) => {
  return api.post('/auth/reset', { email, resetToken, newPassword });
};