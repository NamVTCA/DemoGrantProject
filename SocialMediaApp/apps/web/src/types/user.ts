// File: apps/web/src/types/user.ts

// ===================================================================
// ==  ĐÂY LÀ PHIÊN BẢN CHUẨN, ĐỒNG BỘ VỚI SCHEMA TỪ BACKEND CỦA BẠN ==
// ===================================================================

/**
 * Định nghĩa đầy đủ cho đối tượng User.
 * Mọi component trong Frontend sẽ sử dụng kiểu dữ liệu này.
 */
export interface AuthUser {
  _id: string; // Mongoose tự động tạo _id kiểu string sau khi populate
  username: string;
  email: string;
  exp: number;
  balance: number;
  gender: 'male' | 'female' | 'other';
  status: boolean;
  hideProfile: boolean;
  interest_id: string[]; // ObjectId từ backend sẽ là string ở frontend
  friend_id: string[];
  acceptFriend: string[];
  global_role_id: string;
  notification: string[];
  type_id: string[];
  avatar?: string; // Optional fields
  address?: string;
  birthday?: string; // Date từ backend thường được gửi dưới dạng chuỗi ISO
  createdAt: string;
  updatedAt: string;
}

/**
 * Định nghĩa chuẩn cho response của API login.
 */
export interface LoginResponse {
  access_token: string;
  user: AuthUser; // Sử dụng AuthUser chuẩn ở trên
}


// =======================================================
// ==     CÁC DTO CŨ CỦA BẠN (GIỮ NGUYÊN)               ==
// =======================================================

/**
 * Dto tương ứng với CreateUserDto ở backend NestJS
 */
export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  avatar?: string;
  address?: string;
  birthday?: string; // ISO string yyyy-mm-dd
  status?: boolean;
  global_role_id?: string;
  hideProfile?: boolean;
  notification?: string[];
  type_id?: string[];
  interest_id?: string[];
  friend_id?: string[];
  acceptFriend?: string[];
  gender?: 'male' | 'female' | 'other';
}

/**
 * Dto tương ứng với UpdateUserDto ở backend NestJS
 * Các trường đều optional để cập nhật linh hoạt
 */
export interface UpdateUserDto {
  username?: string;
  avatar?: string;
  address?: string;
  birthday?: string;
  status?: boolean;
  hideProfile?: boolean;
  global_role_id?: string;
  notification?: string[];
  type_id?: string[];
  interest_id?: string[];
  friend_id?: string[];
  acceptFriend?: string[];
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  age?: number;
  location?: string;
  statusMessage?: string;
  website?: string;
}