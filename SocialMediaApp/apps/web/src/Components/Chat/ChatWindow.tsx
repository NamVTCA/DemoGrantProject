import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import styles from './ChatWindow.module.scss';
import { FaPaperPlane } from 'react-icons/fa'; // Import icon máy bay giấy

// Interfaces
interface UserInfo { _id: string; username: string; avatar?: string; }
interface Message { _id: string; sender_id: UserInfo; content: string; room_id: string; createdAt: string; }

interface ChatWindowProps {
  roomId: string;
  chatName: string;
  chatAvatar?: string;
}

const socket: Socket = io('http://localhost:9090');

export default function ChatWindow({ roomId, chatName, chatAvatar }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = localStorage.getItem('userId');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Hàm để tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Lấy lịch sử tin nhắn khi vào phòng
    const fetchHistory = async () => {
        if (!roomId) return;
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
      }
    };
    socket.on('newMessage', handleNewMessage);
    
    // Tham gia phòng
    if (roomId) socket.emit('joinRoom', roomId);

    // Cleanup
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [roomId]);

  // Tự động cuộn khi có tin nhắn mới
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentUserId && roomId) {
      socket.emit('sendMessage', {
        senderId: currentUserId,
        roomId: roomId,
        content: newMessage,
      });
      setNewMessage('');
    }
  };

  return (
    <div className={styles.chatWindow}>
      <header className={styles.header}>
        <img src={chatAvatar || '/default-avatar.png'} alt="avatar" />
        <h3>{chatName}</h3>
      </header>

      <main className={styles.messageList}>
        {messages.map((msg, index) => (
          <div 
            key={msg._id || `msg-${index}`}
            className={`${styles.message} ${msg.sender_id._id === currentUserId ? styles.myMessage : styles.theirMessage}`}
          >
            <div className={styles.bubble}>
                {msg.sender_id._id !== currentUserId && 
                    <strong className={styles.senderName}>{msg.sender_id.username}</strong>
                }
                <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className={styles.footer}>
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
      </footer>
    </div>
  );
}