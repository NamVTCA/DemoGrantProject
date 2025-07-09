import React, { useState, useEffect } from 'react';
import ConversationList from '../../Components/Messenger/ConversationList';
import type { Conversation } from '../../Components/Messenger/ConversationList';
import ChatWindow from '../../Components/Chat/ChatWindow';
import styles from './MessengerPage.module.scss';

export default function MessengerPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const response = await fetch('http://localhost:9090/chatroom/my-rooms', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Không thể tải danh sách trò chuyện.");
        
        const data = await response.json();
        setConversations(data);
        
      } catch (error) {
        console.error("Lỗi khi tải danh sách trò chuyện:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  return (
      <div className={styles.messengerContainer}>
        <div className={styles.sidebar}>
            <ConversationList 
              conversations={conversations} 
              onSelect={setActiveConversation}
              activeConversationId={activeConversation?._id}
              isLoading={loading}
            />
        </div>
        <div className={styles.chatArea}>
          {activeConversation ? (
            <ChatWindow
              key={activeConversation._id}
              roomId={activeConversation._id}
              chatName={activeConversation.name || "Cuộc trò chuyện"}
            />
          ) : (
            <div className={styles.noChatSelected}>
              <h2>Chào mừng đến với Messenger</h2>
              <p>Chọn một cuộc trò chuyện để bắt đầu.</p>
            </div>
          )}
        </div>
      </div>
  );
}