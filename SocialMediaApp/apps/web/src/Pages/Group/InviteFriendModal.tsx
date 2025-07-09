// font-end/src/Pages/Group/InviteFriendModal.tsx
import { useEffect, useState } from 'react';
import styles from './InviteFriendModal.module.scss';

interface IFriendInfo {
  _id: string;
  username: string;
  avatar?: string;
}

interface InviteFriendModalProps {
  groupId: string;
  onClose: () => void;
}

export default function InviteFriendModal({ groupId, onClose }: InviteFriendModalProps) {
  const [friends, setFriends] = useState<IFriendInfo[]>([]);
  const [invited, setInvited] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:9090/users/me", { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            const friendIds = data.data.friend_id || [];
            if (friendIds.length > 0) {
                const friendDetails = await Promise.all(
                    friendIds.map((id: string) => fetch(`http://localhost:9090/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()))
                );
                setFriends(friendDetails.filter(r => r.data).map(r => r.data));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchFriends();
  }, []);

  // --- HÀM ĐÃ ĐƯỢC CẬP NHẬT ---
  const handleInvite = async (friendId: string) => {
    const token = localStorage.getItem('token');
    try {
        // Gọi đúng endpoint và phương thức POST
        const response = await fetch(`http://localhost:9090/group/invite-member`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Thêm header Content-Type
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ groupId, friendId }), // Gửi dữ liệu trong body
        });

        if (response.ok) {
            // Chỉ cập nhật trạng thái "Đã mời" nếu request thành công
            setInvited(prev => [...prev, friendId]);
        } else {
            // Xử lý lỗi (ví dụ: hiển thị thông báo)
            const errorData = await response.json();
            console.error("Lỗi khi mời bạn:", errorData.message);
            alert(`Không thể mời bạn: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
        alert("Đã xảy ra lỗi khi gửi lời mời.");
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3>Mời bạn bè vào nhóm</h3>
        {loading ? <p>Đang tải danh sách bạn bè...</p> : (
            <ul className={styles.friendList}>
                {friends.map(friend => (
                    <li key={friend._id}>
                        <div className={styles.userInfo}>
                            <img src={friend.avatar || '/default-avatar.png'} alt="avatar"/>
                            <span>{friend.username}</span>
                        </div>
                        <button 
                            onClick={() => handleInvite(friend._id)} 
                            disabled={invited.includes(friend._id)}
                            className={invited.includes(friend._id) ? styles.invitedBtn : styles.inviteBtn}>
                            {invited.includes(friend._id) ? 'Đã mời' : 'Mời'}
                        </button>
                    </li>
                ))}
            </ul>
        )}
      </div>
    </div>
  );
}