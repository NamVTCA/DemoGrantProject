// font-end/src/Pages/Group/GroupPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './GroupPage.module.scss';
import { FaDoorOpen, FaHourglassHalf, FaUserCog, FaCheck } from 'react-icons/fa';
import PendingRequests from './PendingRequests';

// Interfaces (giữ nguyên)
interface UserInfo {
  _id: string;
  username: string;
  avatar?: string;
}
interface GroupDetails {
  _id: string;
  name: string;
  description: string;
  owner: UserInfo;
  members: UserInfo[];
}
type UserStatus = 'loading' | 'owner' | 'member' | 'pending' | 'not_member';

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>('loading');
  const [error, setError] = useState('');
  const [showPending, setShowPending] = useState(false);
  
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    // ... (Phần fetchGroupData giữ nguyên như cũ)
    if (!groupId) return;
    const token = localStorage.getItem('token');
    const fetchGroupData = async () => {
      setUserStatus('loading');
      try {
        const response = await fetch(`http://localhost:9090/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Không thể tải thông tin nhóm.');
        const data: GroupDetails = await response.json();
        setGroup(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchGroupData();
  }, [groupId]);

  useEffect(() => {
    if (!group || !currentUserId) return;

    // ================================================
    // ==         BƯỚC DEBUG BẮT ĐẦU TỪ ĐÂY         ==
    // ================================================
    console.log("ĐANG KIỂM TRA VAI TRÒ NGƯỜI DÙNG:");
    console.log("ID người dùng hiện tại (từ localStorage):", `"${currentUserId}"`, `(Kiểu: ${typeof currentUserId})`);
    console.log("Đối tượng chủ nhóm (từ API):", group.owner);
    console.log("ID của chủ nhóm (từ API):", `"${group.owner._id}"`, `(Kiểu: ${typeof group.owner._id})`);
    // ================================================
    // ==             BƯỚC DEBUG KẾT THÚC             ==
    // ================================================

    if (group.owner._id === currentUserId) {
      console.log(">>> KẾT QUẢ: Xác nhận là CHỦ NHÓM.");
      setUserStatus('owner');
    } else if (group.members.some(member => member._id === currentUserId)) {
      console.log(">>> KẾT QUẢ: Xác nhận là THÀNH VIÊN.");
      setUserStatus('member');
    } else {
      console.log(">>> KẾT QUẢ: Xác nhận là KHÁCH (chưa phải thành viên).");
      // Logic kiểm tra pending sẽ được xử lý riêng
      setUserStatus('not_member');
    }
  }, [group, currentUserId]);


  // ... (các hàm handleRequestToJoin và renderActionButton giữ nguyên như cũ)
  const handleRequestToJoin = async () => {
    const token = localStorage.getItem('token');
    setUserStatus('loading');
    try {
      const response = await fetch(`http://localhost:9090/group/${groupId}/request-join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gửi yêu cầu thất bại.');
      setUserStatus('pending');
    } catch (err: any) {
      setError(err.message);
      setUserStatus('not_member');
    }
  };
  
  const renderActionButton = () => {
    switch (userStatus) {
      case 'loading':
        return <button className={styles.actionButton} disabled>Đang tải...</button>;
      case 'owner':
        return <button className={styles.actionButton} onClick={() => setShowPending(!showPending)}><FaUserCog /> {showPending ? 'Đóng Quản lý' : 'Quản lý Yêu cầu'}</button>;
      case 'member':
        return <button className={`${styles.actionButton} ${styles.joined}`} disabled><FaCheck /> Đã tham gia</button>;
      case 'pending':
        return <button className={`${styles.actionButton} ${styles.pending}`} disabled><FaHourglassHalf /> Đã gửi yêu cầu</button>;
      case 'not_member':
        return <button className={styles.actionButton} onClick={handleRequestToJoin}><FaDoorOpen /> Xin vào nhóm</button>;
      default:
        return null;
    }
  };

  if (error) return <div className={styles.error}>{error}</div>;
  if (!group) return <div className={styles.pageLoader}>Đang tải trang nhóm...</div>;

  return (
    <div className={styles.groupPage}>
      <div className={styles.coverImage} />
      <div className={styles.header}>
        <h1>{group.name}</h1>
        <p>{group.description}</p>
        {renderActionButton()}
      </div>
      
      {userStatus === 'owner' && showPending && (
        <div className={styles.managementSection}>
           <PendingRequests groupId={groupId!} />
        </div>
      )}

      <div className={styles.content}>
        <h3>Thành viên ({group.members.length})</h3>
        <div className={styles.memberList}>
          {group.members.map(member => (
            <div key={member._id} className={styles.memberItem} onClick={() => navigate(`/user/${member._id}`)}>
              <img src={member.avatar || '/default-avatar.png'} alt={member.username} />
              <span>{member.username}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}