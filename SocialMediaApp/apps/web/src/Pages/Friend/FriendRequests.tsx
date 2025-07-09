// font-end/src/Pages/Friend/FriendRequests.tsx

import { useEffect, useState } from 'react';
import styles from './FriendRequests.module.scss';
import { FaCheck, FaTimes } from 'react-icons/fa';
import io from 'socket.io-client';

// Kết nối tới server Socket.IO
const socket = io('http://localhost:9090');

// Định nghĩa kiểu dữ liệu cho một người gửi lời mời
interface Requester {
    _id: string;
    username: string;
    avatar?: string;
}

const FriendRequests = () => {
    const [requests, setRequests] = useState<Requester[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Không set isLoading ở đây nữa để tránh hiện "Đang tải..." khi cập nhật real-time
            try {
                const response = await fetch('http://localhost:9090/users/friend/requests/pending', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setRequests(data);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách lời mời:", error);
            } finally {
                // Chỉ set isLoading thành false ở lần tải đầu tiên
                if (isLoading) {
                    setIsLoading(false);
                }
            }
        };

        // 1. Tải danh sách lần đầu khi component được mount
        setIsLoading(true);
        fetchRequests();

        // 2. Lắng nghe sự kiện real-time cho lời mời mới
        socket.on('new_friend_request', () => {
            console.log("Nhận được lời mời kết bạn mới, đang cập nhật...");
            fetchRequests(); // Tải lại danh sách khi có lời mời mới
        });

        // 3. Hủy lắng nghe khi component unmount để tránh memory leak
        return () => {
            socket.off('new_friend_request');
        };
    }, [isLoading]); // Thêm isLoading vào dependency array để quản lý state loading cho đúng

    // Hàm xử lý khi nhấn nút Chấp nhận hoặc Từ chối
    const handleRequestAction = async (requesterId: string, action: 'accept' | 'reject') => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:9090/users/friend/${action}/${requesterId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                // Nếu thành công, xóa lời mời đó khỏi danh sách trên UI
                setRequests(prevRequests => prevRequests.filter(req => req._id !== requesterId));
            } else {
                console.error(`Thất bại khi ${action} lời mời`);
            }
        } catch (error) {
            console.error("Lỗi khi thực hiện hành động:", error);
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>Đang tải...</div>;
    }

    return (
        <div className={styles.requestsContainer}>
            <h3>Lời mời kết bạn</h3>
            {requests.length > 0 ? (
                <ul className={styles.requestList}>
                    {requests.map((requester) => (
                        <li key={requester._id} className={styles.requestItem}>
                            <img src={requester.avatar || '/default-avatar.png'} alt="avatar" />
                            <span className={styles.username}>{requester.username}</span>
                            <div className={styles.actions}>
                                <button
                                    className={`${styles.actionButton} ${styles.accept}`}
                                    onClick={() => handleRequestAction(requester._id, 'accept')}
                                >
                                    <FaCheck /> Chấp nhận
                                </button>
                                <button
                                    className={`${styles.actionButton} ${styles.reject}`}
                                    onClick={() => handleRequestAction(requester._id, 'reject')}
                                >
                                    <FaTimes /> Từ chối
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.noRequests}>Bạn không có lời mời kết bạn nào.</p>
            )}
        </div>
    );
};

export default FriendRequests;