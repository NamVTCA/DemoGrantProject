// File: apps/web/src/Pages/Friend/FriendListItem.tsx

import React from 'react';
// Không cần import useNotifications nữa vì chúng ta tạm thời không hiển thị badge
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
  isOnline: boolean;
  onClick: (friend: Friend) => void;
}

export default function FriendListItem({ friend, isOnline, onClick }: Props) {
  // ## SỬA LỖI Ở ĐÂY ##
  // Tạm thời xóa bỏ logic sử dụng unreadCounts để ứng dụng có thể chạy.
  // Chúng ta sẽ quay lại tính năng này sau khi mọi thứ đã ổn định.

  return (
    <li className={styles.friendItem} onClick={() => onClick(friend)}>
      <div className={styles.avatarContainer}>
        <img src={friend.avatar || '/default-avatar.png'} alt={friend.username} />

        {/* Luôn hiển thị trạng thái online nếu isOnline là true */}
        {isOnline && <div className={styles.onlineBadge}></div>}

        {/* Logic hiển thị badge đã được tạm thời vô hiệu hóa */}
      </div>
      <p>{friend.username}</p>
    </li>
  );
}
