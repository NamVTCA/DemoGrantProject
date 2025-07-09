import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext'; // <-- Use the newly created AuthContext hook

interface ISocketContext {
  socket: Socket | null;
}

const SocketContext = createContext<ISocketContext>({ socket: null });

// Custom hook to easily access the socket context
export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth(); // <-- Get user from our new AuthContext

  useEffect(() => {
    if (user?._id) {
      // Connect to the server with the userId in the query
      const newSocket = io('http://localhost:9090', {
        query: { userId: user._id },
      });
      setSocket(newSocket);

      // Dọn dẹp khi component unmount
      return () => {
        newSocket.disconnect();
      };
    } else {
      // Nếu không có user, ngắt kết nối socket hiện tại (nếu có)
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]); // Re-run this effect if the user changes (login/logout)

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};