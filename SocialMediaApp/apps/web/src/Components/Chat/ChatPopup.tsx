// src/components/Chat/ChatPopup.tsx

import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatPopup.module.scss';
import { FaPaperPlane } from 'react-icons/fa';
import { useNotifications } from '../../contexts/NotificationContext';

// Định nghĩa lại các Interface ở đây
interface UserInfo {
  _id: string;
  username: string;
  avatar?: string;
}
interface Message {
  _id: string;
  sender_id: UserInfo;
  content: string;
  room_id: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'seen'; // Thêm trường status
}
interface ChatPopupProps {
  roomId: string;
  chatName: string;
  chatAvatar?: string;
  otherUserId: string; // ID của người đang chat cùng
  onClose: () => void; // Hàm để đóng popup
}

export default function ChatPopup({ roomId, chatName, chatAvatar, otherUserId, onClose }: ChatPopupProps) {
  const { socket, markNotificationsAsRead } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = localStorage.getItem('userId');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    // Đánh dấu đã đọc khi mở chat
    markNotificationsAsRead(otherUserId);
    
    // Gửi sự kiện đang đọc tin nhắn lên server
    socket.emit('messagesRead', { roomId, senderId: otherUserId });

    // Lấy lịch sử tin nhắn
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:9090/message/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setMessages(data);
      } catch (error) { console.error("Lỗi tải lịch sử chat:", error); }
    };
    fetchHistory();

    // Lắng nghe tin nhắn mới
    const handleNewMessage = (message: Message) => {
      if (message.room_id === roomId) {
        setMessages(prev => [...prev, message]);
        // Báo lại cho server là đã đọc tin nhắn vừa nhận được
        socket.emit('messagesRead', { roomId, senderId: otherUserId });
      }
    };
    
    // Lắng nghe cập nhật trạng thái
    const handleStatusUpdate = ({ messageId, status }: { messageId: string, status: Message['status'] }) => {
      setMessages(prev => prev.map(msg => (msg._id === messageId ? { ...msg, status } : msg)));
    };

    const handleAllMessagesRead = ({ roomId: readRoomId }: { roomId: string }) => {
      if (readRoomId === roomId) {
        setMessages(prev => prev.map(msg => (msg.sender_id._id === currentUserId ? { ...msg, status: 'seen' } : msg)));
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageStatusUpdate', handleStatusUpdate);
    socket.on('allMessagesInRoomRead', handleAllMessagesRead);
    
    socket.emit('joinRoom', roomId);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageStatusUpdate', handleStatusUpdate);
      socket.off('allMessagesInRoomRead', handleAllMessagesRead);
    };
  }, [roomId, socket, otherUserId, markNotificationsAsRead]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentUserId && roomId) {
      socket.emit('sendMessage', {
        senderId: currentUserId,
        receiver_id: otherUserId, // Thêm receiver_id để backend biết gửi cho ai
        roomId: roomId,
        content: newMessage,
      });
      setNewMessage('');
    }
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        <img src={chatAvatar || '/default-avatar.png'} alt="avatar" />
        <h3>{chatName}</h3>
        <button onClick={onClose} className={styles.closeButton}>X</button>
      </div>
      <div className={styles.messageList}>
        {messages.map((msg) => (
          <div 
            key={msg._id}
            className={`${styles.message} ${msg.sender_id._id === currentUserId ? styles.myMessage : styles.theirMessage}`}
          >
            <div className={styles.bubble}>
              {msg.sender_id._id !== currentUserId && 
                <strong className={styles.senderName}>{msg.sender_id.username}</strong>
              }
              <p>{msg.content}</p>
            </div>
            {msg.sender_id._id === currentUserId && (
              <div className={styles.messageStatus}>
                {msg.status === 'seen' && <small>Đã xem</small>}
                {msg.status === 'delivered' && <small>Đã gửi</small>}
                {msg.status === 'sent' && <small>Đang gửi...</small>}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          autoComplete="off"
        />
        <button type="submit" disabled={!newMessage.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}