// File: apps/web/src/Api/postApi.ts
import { api } from './api';
import type { CreatePostDto } from '../types/post'; // Giả sử bạn có type này

export const postApi = {
  /**
   * Lấy tất cả bài viết (đường dẫn đúng là /posts)
   */
  getAllPosts: () => {
    return api.get('/posts');
  },

  /**
   * Tạo một bài viết mới
   */
  createPost: (postData: CreatePostDto) => {
    return api.post('/posts', postData);
  },

  // Thêm các hàm khác như like, comment sau này
};