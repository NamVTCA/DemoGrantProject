import styles from "../../Pages/messenger/Messenger.module.scss";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export interface Conversation {
  _id: string;
  name: string;
  avatar?: string;
  // Thêm các trường khác nếu cần, ví dụ: lastMessage
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  activeConversationId?: string;
  isLoading: boolean;
}

export default function ConversationList({
  conversations,
  onSelect,
  activeConversationId,
  isLoading,
}: ConversationListProps) {
  return (
    <div className={styles.conversationList}>
      <div className={styles.listHeader}>
        <h2>Chat</h2>
        {/* Có thể thêm các nút lọc ở đây */}
      </div>
      <div className={styles.listContent}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <AiOutlineLoading3Quarters className={styles.spinner} />
          </div>
        ) : (
          <ul>
            {conversations.map((convo) => (
              <li
                key={convo._id}
                className={`${styles.conversationItem} ${
                  activeConversationId === convo._id ? styles.active : ""
                }`}
                onClick={() => onSelect(convo)}
              >
                <img
                  src={convo.avatar || "/default-avatar.png"}
                  alt={convo.name}
                  className={styles.avatar}
                />
                <div className={styles.convoDetails}>
                  <strong>{convo.name}</strong>
                  {/* <span className={styles.lastMessage}>Tin nhắn cuối...</span> */}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
