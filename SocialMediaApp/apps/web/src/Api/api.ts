import axios from 'axios';

// Tạo một instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: 'http://localhost:9090', // URL gốc của backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor (Người gác cổng) cho mỗi request ---
// Trước khi một request được gửi đi, chúng ta sẽ làm điều này:
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    if (token) {
      // Nếu có token, gắn nó vào header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Trả về config đã được chỉnh sửa
  },
  (error) => {
    // Nếu có lỗi trong quá trình thiết lập request, reject promise
    return Promise.reject(error);
  },
);

// --- Interceptor cho mỗi response ---
// Sau khi nhận được response từ backend, chúng ta sẽ làm điều này:
api.interceptors.response.use(
  (response) => {
    // Bất kỳ response nào có status code trong khoảng 2xx sẽ đi vào đây
    // Chúng ta trả về thẳng phần data của response cho gọn
    return response.data;
  },
  (error) => {
    // Bất kỳ response nào có status code ngoài 2xx sẽ đi vào đây
    if (error.response?.status === 401) {
      // Xử lý lỗi token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      // Chuyển hướng về trang đăng nhập và tải lại trang
      window.location.href = '/login';
    }

    // Ném lỗi với thông điệp từ backend (nếu có) hoặc lỗi mặc định
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    return Promise.reject(new Error(message));
  },
);

export { api };