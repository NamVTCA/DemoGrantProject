import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import styles from './FriendListItem.module.scss';

// Định nghĩa kiểu dữ liệu cho một người bạn
interface Friend {
  _id: string;
  username: string;
  avatar?: string;
}

// Props cho component
interface Props {
  friend: Friend;
  isOnline: boolean; // <-- Thêm lại prop này để nhận trạng thái online
  onClick: (friend: Friend) => void;
}

export default function FriendListItem({ friend, isOnline, onClick }: Props) {
  const { unreadCounts } = useNotifications();
  // Lấy số tin nhắn chưa đọc từ người bạn này
  const count = unreadCounts[friend._id] || 0;

  return (
    <li className={styles.friendItem} onClick={() => onClick(friend)}>
      <div className={styles.avatarContainer}>
        <img src={friend.avatar || '/default-avatar.png'} alt={friend.username} />

        {/* Luôn hiển thị trạng thái online nếu isOnline là true */}
        {isOnline && <div className={styles.onlineBadge}></div>}

        {/* Chỉ hiển thị số tin nhắn chưa đọc nếu có và không bị che bởi chấm online */}
        {count > 0 && (
          <span className={styles.badge}>{count}</span>
        )}
      </div>
      <p>{friend.username}</p>
    </li>
  );
}