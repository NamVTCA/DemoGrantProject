import React from 'react';
import { useChat } from '../../Context/ChatContext';
import ChatPopup from './ChatPopup';
import styles from './ChatContainer.module.scss';

export default function ChatContainer() {
  // 1. Lấy thêm hàm closeChat từ context
  const { openChats, closeChat } = useChat();

  return (
    <div className={styles.chatContainer}>
      {openChats.map((chat, index) => (
        // 2. Sửa key thành `chat.roomId` cho đúng với cấu trúc state mới
        <div key={chat.roomId} className={styles.popupWrapper} style={{ right: `${index * 420 + 20}px` }}>
          <ChatPopup
            // 3. Cập nhật lại toàn bộ props cho đúng với định nghĩa của ChatPopup
            roomId={chat.roomId}
            chatName={chat.name}
            chatAvatar={chat.avatar}
            otherUserId={chat.otherUserId}
            onClose={() => closeChat(chat.roomId)}
          />
        </div>
      ))}
    </div>
  );
}