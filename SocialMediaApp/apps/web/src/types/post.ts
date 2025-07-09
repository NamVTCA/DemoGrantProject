// File: apps/web/src/types/post.ts

import type { AuthUser } from './user'; // Import kiểu AuthUser

// Định nghĩa kiểu dữ liệu cho một đối tượng Post đầy đủ
export interface Post {
  _id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'mixed';
  status: 'pending' | 'approved' | 'rejected';
  author: AuthUser; // Tác giả sẽ là một đối tượng User đầy đủ
  likes: string[]; // Danh sách các ID của người dùng đã like
  createdAt: string;
  updatedAt: string;
  shortVideo?: string; // Video có thể có hoặc không
}

// Định nghĩa kiểu dữ liệu để tạo một bài viết mới
// Nó phải khớp với CreatePostDto ở backend
export interface CreatePostDto {
  title: string;
  content: string;
  type: 'text' | 'video' | 'mixed';
  shortVideo?: string;
}