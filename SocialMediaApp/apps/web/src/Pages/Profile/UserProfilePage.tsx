import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './UserProfilePage.module.scss';
import { FaUserPlus, FaUserCheck, FaUserClock, FaUserFriends, FaRss, FaCheck } from 'react-icons/fa';
import { api } from '../../Api/api'; // Giả sử bạn có một file quản lý API tập trung

// Mở rộng kiểu dữ liệu để bao gồm cả EXP và isFollowing
interface UserProfile {
    _id: string;
    username: string;
    avatar?: string;
    xp: number; // Thêm điểm kinh nghiệm
}

type FriendshipStatus = 'loading' | 'friends' | 'request_sent' | 'request_received' | 'not_friends';

export default function UserProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [friendStatus, setFriendStatus] = useState<FriendshipStatus>('loading');
    
    // --- State mới cho chức năng Follow ---
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const [message, setMessage] = useState('');
    const currentUserId = localStorage.getItem('userId');

    // Hàm fetch dữ liệu đã được tối ưu
    const fetchData = useCallback(async () => {
        if (!userId) return;
        
        // Reset state khi tải profile mới
        setFriendStatus('loading');
        setIsFollowLoading(true);
        try {
            // Gọi API để lấy cả thông tin profile và các trạng thái liên quan
            const { data } = await api.get(`/users/profile/${userId}`);
            
            setUser(data.profile);
            setFriendStatus(data.friendshipStatus);
            setIsFollowing(data.isFollowing);

        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Không thể tải dữ liệu người dùng.');
        } finally {
            setIsFollowLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId === currentUserId) {
            navigate('/profile'); // Chuyển hướng về trang cá nhân của chính mình
            return;
        }
        fetchData();
    }, [userId, currentUserId, navigate, fetchData]);

    // --- Hàm xử lý cho chức năng Bạn bè ---
    const handleAddFriend = async () => {
        setFriendStatus('loading');
        try {
            await api.post(`/users/friend/request/${userId}`);
            setFriendStatus('request_sent');
            setMessage('Đã gửi lời mời kết bạn!');
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Gửi lời mời thất bại.');
            setFriendStatus('not_friends');
        }
    };

    // --- Hàm xử lý cho chức năng Follow ---
    const handleFollowToggle = async () => {
        setIsFollowLoading(true);
        try {
            if (isFollowing) {
                // Gọi API để bỏ theo dõi
                await api.delete(`/follow/${userId}`);
                setIsFollowing(false);
            } else {
                // Gọi API để theo dõi
                await api.post(`/follow/${userId}`);
                setIsFollowing(true);
            }
        } catch (error: any) {
             setMessage(error.response?.data?.message || 'Thao tác thất bại.');
        } finally {
            setIsFollowLoading(false);
        }
    };
    
    // --- Component để render thanh EXP ---
    const ExpBar = ({ xp }: { xp: number }) => {
        const LEVEL_EXP_REQUIREMENT = 100;
        const level = Math.floor(xp / LEVEL_EXP_REQUIREMENT) + 1;
        const currentLevelExp = xp % LEVEL_EXP_REQUIREMENT;
        const progressPercentage = (currentLevelExp / LEVEL_EXP_REQUIREMENT) * 100;

        return (
            <div className={styles.expBarContainer}>
                <div className={styles.levelLabel}>Level {level}</div>
                <div className={styles.expBar}>
                    <div 
                        className={styles.expBarProgress} 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div className={styles.expText}>{currentLevelExp} / {LEVEL_EXP_REQUIREMENT} XP</div>
            </div>
        );
    };

    // --- Component để render các nút hành động ---
    const ActionButtons = () => (
        <div className={styles.actionButtonsContainer}>
            {/* Nút Bạn bè */}
            {friendStatus === 'not_friends' && <button className={styles.actionButton} onClick={handleAddFriend}><FaUserPlus /> Thêm bạn bè</button>}
            {friendStatus === 'friends' && <button className={`${styles.actionButton} ${styles.success}`} disabled><FaUserFriends /> Bạn bè</button>}
            {friendStatus === 'request_sent' && <button className={`${styles.actionButton} ${styles.pending}`} disabled><FaUserClock /> Đã gửi lời mời</button>}
            {friendStatus === 'request_received' && <button className={styles.actionButton} onClick={() => navigate('/notifications')}>Phản hồi lời mời</button>}
            
            {/* Nút Follow */}
            <button className={`${styles.actionButton} ${styles.followButton}`} onClick={handleFollowToggle} disabled={isFollowLoading}>
                {isFollowing ? <><FaCheck /> Đang theo dõi</> : <><FaRss /> Theo dõi</>}
            </button>
        </div>
    );

    if (!user && (friendStatus === 'loading' || isFollowLoading)) return <div className={styles.loading}>Đang tải trang cá nhân...</div>;
    if (!user) return <div className={styles.error}>{message || 'Không thể tìm thấy người dùng này.'}</div>;

    return (
        <div className={styles.profileUserPage}>
            <div className={styles.profileCard}>
                <div className={styles.avatarSection}>
                    <img src={user.avatar || '/default-avatar.png'} alt="Avatar" className={styles.avatar} />
                    <h2>{user.username}</h2>
                    <ExpBar xp={user.xp} /> {/* <-- Hiển thị thanh EXP */}
                </div>
                <div className={styles.infoGrid}>
                    <ActionButtons /> {/* <-- Hiển thị các nút hành động */}
                    {message && <p className={styles.feedbackMessage}>{message}</p>}
                </div>
            </div>
        </div>
    );
}