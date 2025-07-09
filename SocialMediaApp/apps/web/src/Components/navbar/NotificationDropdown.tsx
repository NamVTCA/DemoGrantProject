import React, { useState, useEffect, useRef } from 'react';
import styles from './NotificationDropdown.module.scss';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Định nghĩa kiểu dữ liệu cho một thông báo
interface Notification {
  _id: string;
  sender_id: {
    _id: string;
    username: string;
    avatar?: string;
  };
  title: string;
  type: 'FRIEND_REQUEST' | 'GROUP_JOIN_REQUEST' | 'INFO' | string; // Mở rộng các loại thông báo
  metadata?: {
    groupId?: string;
    senderId?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Lắng nghe click bên ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch thông báo khi dropdown được mở
    useEffect(() => {
        if (!isOpen) return;
        const fetchNotis = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('http://localhost:9090/notification/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setNotifications(data);
            } catch (error) {
                console.error("Lỗi khi tải thông báo:", error);
            }
        };
        fetchNotis();
    }, [isOpen]);

    // Hàm xử lý khi nhấn vào một thông báo
    const handleNotificationClick = (notification: Notification) => {
        // Đánh dấu đã đọc, chuyển hướng, v.v.
        // Ví dụ: chuyển đến trang cá nhân của người gửi
        navigate(`/user/${notification.sender_id._id}`);
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className={styles.iconButton}>
                <FaBell />
                {/* Badge đếm thông báo chưa đọc */}
                {notifications.some(n => !n.isRead) && <span className={styles.badge}></span>}
            </button>
            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div className={styles.header}>Thông báo</div>
                    <ul className={styles.notificationList}>
                        {notifications.length > 0 ? notifications.map(noti => (
                            <li 
                                key={noti._id} 
                                className={`${styles.notificationItem} ${!noti.isRead ? styles.unread : ''}`}
                                onClick={() => handleNotificationClick(noti)}
                            >
                                <img src={noti.sender_id.avatar || '/default-avatar.png'} alt="sender"/>
                                <div className={styles.content}>
                                    <p><b>{noti.sender_id.username}</b> {noti.title}</p>
                                    <small>{new Date(noti.createdAt).toLocaleString('vi-VN')}</small>
                                </div>
                            </li>
                        )) : <li className={styles.noNotifications}>Không có thông báo mới.</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}