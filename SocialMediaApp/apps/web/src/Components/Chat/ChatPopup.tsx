// File: apps/web/src/Components/Chat/ChatPopup.tsx

import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatPopup.module.scss';
import { FaPaperPlane } from 'react-icons/fa';
import { useSocket } from '../../Context/SocketContext';
import { useAuthContext } from '../../Context/AuthContext';
import { api } from '../../Api/api';

// Định nghĩa lại các Interface
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
  status: 'sent' | 'delivered' | 'seen';
}
interface ChatPopupProps {
  roomId: string;
  chatName: string;
  chatAvatar?: string;
  otherUserId: string;
  onClose: () => void;
}

export default function ChatPopup({ roomId, chatName, chatAvatar, otherUserId, onClose }: ChatPopupProps) {
  const { socket } = useSocket();
  const { authUser } = useAuthContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    if (!socket || !authUser) return;

    socket.emit('messagesRead', { roomId, senderId: otherUserId });

    const fetchHistory = async () => {
      try {
        // ## SỬA LỖI Ở ĐÂY ##
        // Dùng ép kiểu 2 bước để báo cho TypeScript về cấu trúc thật của dữ liệu
        const data = (await api.get(`/message/${roomId}`)) as unknown as Message[];
        setMessages(data || []);
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
      }
    };
    fetchHistory();

    const handleNewMessage = (message: Message) => {
      if (message.room_id === roomId) {
        setMessages(prev => [...prev, message]);
        socket.emit('messagesRead', { roomId, senderId: otherUserId });
      }
    };
    
    const handleStatusUpdate = ({ messageId, status }: { messageId: string, status: Message['status'] }) => {
      setMessages(prev => prev.map(msg => (msg._id === messageId ? { ...msg, status } : msg)));
    };

    const handleAllMessagesRead = ({ roomId: readRoomId }: { roomId: string }) => {
      if (readRoomId === roomId) {
        setMessages(prev => prev.map(msg => (msg.sender_id._id === authUser._id ? { ...msg, status: 'seen' } : msg)));
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
  }, [roomId, socket, otherUserId, authUser]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && authUser && roomId && socket) {
      socket.emit('sendMessage', {
        senderId: authUser._id,
        receiver_id: otherUserId,
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
            className={`${styles.message} ${msg.sender_id._id === authUser?._id ? styles.myMessage : styles.theirMessage}`}
          >
            <div className={styles.bubble}>
              {msg.sender_id._id !== authUser?._id && 
                <strong className={styles.senderName}>{msg.sender_id.username}</strong>
              }
              <p>{msg.content}</p>
            </div>
            {msg.sender_id._id === authUser?._id && (
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
