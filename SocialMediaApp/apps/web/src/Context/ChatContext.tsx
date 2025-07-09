// font-end/src/Context/ChatContext.tsx

import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

// Cấu trúc của một cửa sổ chat đã được cập nhật
interface ChatWindowState {
  roomId: string;      // ID của phòng chat
  otherUserId: string; // ID của người bạn đang chat cùng
  name: string;
  avatar?: string;
}

// Định nghĩa các chức năng mà Context sẽ cung cấp
interface ChatContextType {
  openChats: ChatWindowState[];
  openChat: (user: { id:string; name: string; avatar?: string }) => void;
  closeChat: (roomId: string) => void; // Giờ sẽ đóng bằng roomId
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Custom hook để dễ dàng sử dụng context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat phải được dùng bên trong một ChatProvider');
  }
  return context;
};

// Component Provider
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [openChats, setOpenChats] = useState<ChatWindowState[]>([]);

  const openChat = async (user: { id: string; name: string; avatar?: string }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Chưa đăng nhập!");
        return;
    }

    try {
      // 1. Gọi API để lấy về roomId
      const res = await fetch('http://localhost:9090/chatroom/find-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId: user.id })
      });
      if (!res.ok) throw new Error('Không thể bắt đầu cuộc trò chuyện');

      const chatroom = await res.json();
      const roomId = chatroom._id;

      // 2. Kiểm tra xem cửa sổ chat này đã mở chưa
      if (!openChats.some(chat => chat.roomId === roomId)) {
        
        const newChat: ChatWindowState = {
          roomId: roomId,
          otherUserId: user.id, // <-- Thêm thông tin quan trọng này
          name: user.name,
          avatar: user.avatar
        };

        // Giới hạn chỉ mở tối đa 3 cửa sổ chat
        setOpenChats(prev => [
          ...prev.slice(-2), // Giữ lại 2 cửa sổ chat cũ
          newChat            // Thêm cửa sổ mới
        ]);
      }
    } catch (error) {
      console.error("Lỗi khi mở cửa sổ chat:", error);
    }
  };

  const closeChat = (roomId: string) => {
    // Cập nhật để lọc theo roomId
    setOpenChats(prev => prev.filter(chat => chat.roomId !== roomId));
  };

  return (
    <ChatContext.Provider value={{ openChats, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
};