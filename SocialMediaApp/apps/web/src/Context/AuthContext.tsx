// File: apps/web/src/Context/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
// Import hàm API bạn đã tạo
import { getMyProfile } from '../Api/user';

// 1. Định nghĩa một kiểu dữ liệu chi tiết hơn cho người dùng
// Nó nên khớp với dữ liệu mà API /users/me của bạn trả về
export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  exp: number;
  balance: number;
  // Thêm bất kỳ trường nào khác bạn cần
}

// 2. Mở rộng interface của Context
interface IAuthContext {
  authUser: AuthUser | null;
  setAuthUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  isLoading: boolean;
  logout: () => void;
}

// 3. Tạo Context với giá trị mặc định
export const AuthContext = createContext<IAuthContext | null>(null);

// 4. Tạo Provider Component (Trái tim của Context)
export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 5. Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem('token');
    // Interceptor trong file api.ts của bạn sẽ xử lý việc xóa các item khác
    setAuthUser(null);
  };

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('token');
      // Nếu không có token, không cần làm gì cả, kết thúc việc tải
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Dùng hàm API để gọi lên server và xác thực token
        const response = await getMyProfile();
        // API của bạn trả về { message: '...', data: user }
        if (response.data) {
          setAuthUser(response.data);
        } else {
          // Nếu API trả về thành công nhưng không có data, đăng xuất cho an toàn
          logout();
        }
      } catch (error) {
        console.error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.', error);
        // Interceptor trong api.ts đã xử lý lỗi 401, nhưng chúng ta vẫn gọi logout ở đây để đảm bảo
        logout();
      } finally {
        // Dù thành công hay thất bại, cũng phải kết thúc trạng thái "đang tải"
        setIsLoading(false);
      }
    };

    checkUserSession();
    // Mảng rỗng `[]` đảm bảo useEffect này chỉ chạy 1 lần duy nhất khi app khởi động
  }, []);

  const contextValue = {
    authUser,
    setAuthUser,
    isLoading,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Custom hook để sử dụng Context dễ dàng hơn
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext phải được dùng bên trong một AuthContextProvider');
  }
  return context;
};