import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
// 1. Import hook chuẩn từ AuthContext
import { useAuthContext } from './AuthContext';

interface ISocketContext {
  socket: Socket | null;
}

const SocketContext = createContext<ISocketContext>({ socket: null });

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  // 2. Dùng hook useAuthContext để lấy authUser
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser?._id) {
      const newSocket = io('http://localhost:9090', { // Đảm bảo port đúng với BE
        query: { userId: authUser._id },
      });
      setSocket(newSocket);

      // Dọn dẹp khi component unmount hoặc khi authUser thay đổi
      return () => {
        newSocket.close();
      };
    } else {
      // Nếu không có user (đã logout), ngắt kết nối socket hiện tại
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    // 3. Dependency phải là [authUser]
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};