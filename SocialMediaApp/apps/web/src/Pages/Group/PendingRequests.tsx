// font-end/src/Pages/Group/PendingRequests.tsx
import React, { useEffect, useState } from 'react';
import styles from './PendingRequests.module.scss'; // Tạo file style tương ứng
import { FaCheck, FaTimes } from 'react-icons/fa';

// Kiểu dữ liệu cho một người dùng trong danh sách chờ
interface PendingUser {
  _id: string; // ID của bản ghi GroupMember
  user_id: {
    _id: string; // ID của User
    username: string;
    avatar?: string;
  };
}

interface PendingRequestsProps {
  groupId: string;
}

export default function PendingRequests({ groupId }: PendingRequestsProps) {
  const [requests, setRequests] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingRequests = async () => {
      const token = localStorage.getItem('token');
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:9090/group/${groupId}/pending-members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Không thể tải danh sách yêu cầu.');

        const data = await response.json();
        setRequests(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingRequests();
  }, [groupId]);

  const handleAction = async (targetUserId: string, action: 'accept' | 'reject') => {
    const token = localStorage.getItem('token');
    
    // Cập nhật UI trước để tạo cảm giác phản hồi nhanh
    setRequests(prev => prev.filter(req => req.user_id._id !== targetUserId));

    try {
      const response = await fetch(`http://localhost:9090/group/${groupId}/process-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId, action }),
      });

      if (!response.ok) {
        // Nếu API lỗi, phục hồi lại danh sách (có thể thêm thông báo lỗi)
        // Trong thực tế, bạn sẽ muốn có một hệ thống thông báo lỗi tốt hơn
        console.error('Hành động thất bại');
        // fetchPendingRequests(); // Tải lại danh sách để đồng bộ
      }
      
      // Nếu thành công, không cần làm gì cả vì UI đã được cập nhật

    } catch (err) {
      console.error('Lỗi khi xử lý yêu cầu:', err);
    }
  };

  if (isLoading) return <p className={styles.loading}>Đang tải danh sách...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2>Yêu cầu đang chờ duyệt</h2>
      {requests.length > 0 ? (
        <ul className={styles.requestList}>
          {requests.map(req => (
            <li key={req._id} className={styles.requestItem}>
              <img src={req.user_id.avatar || '/default-avatar.png'} alt="avatar" />
              <span className={styles.username}>{req.user_id.username}</span>
              <div className={styles.actions}>
                <button
                  className={`${styles.actionButton} ${styles.accept}`}
                  onClick={() => handleAction(req.user_id._id, 'accept')}
                >
                  <FaCheck /> Chấp nhận
                </button>
                <button
                  className={`${styles.actionButton} ${styles.reject}`}
                  onClick={() => handleAction(req.user_id._id, 'reject')}
                >
                  <FaTimes /> Từ chối
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noRequests}>Không có yêu cầu nào đang chờ.</p>
      )}
    </div>
  );
}