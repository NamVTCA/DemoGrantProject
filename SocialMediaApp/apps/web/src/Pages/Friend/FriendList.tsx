import { useEffect, useState, useCallback } from "react";
import styles from "../../Style/Widget.module.scss";
import { FaUsers, FaUsersSlash } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useChat } from "../../Context/ChatContext";
import { useSocket } from "../../Context/SocketContext";
import { api } from "../../Api/api";
import FriendListItem from "./FriendListItem";

// --- Định nghĩa kiểu dữ liệu ---
interface IFriendInfo {
  _id: string;
  username: string;
  avatar?: string;
}

// Định nghĩa kiểu cho response từ API, giúp TypeScript không báo lỗi
interface FriendsApiResponse {
  friends: IFriendInfo[];
}

// Đối tượng ảo cho bot, được định nghĩa bên ngoài component
const chatBotUser: IFriendInfo = {
    _id: 'chatbot',
    username: 'Trợ lý ảo',
    avatar: '/chatbot-avatar.png',
};

export default function FriendList() {
  const [friends, setFriends] = useState<IFriendInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set());
  
  const { openChat } = useChat();
  const { socket } = useSocket();

  // Sử dụng useCallback để hàm fetch không bị tạo lại mỗi lần render
  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      // Báo cho `api.get` biết rằng chúng ta mong đợi một object có dạng FriendsApiResponse
      const response = await api.get<FriendsApiResponse>('/users/friends');
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bạn bè:", error);
      // Có thể thêm state để hiển thị lỗi ra giao diện nếu muốn
    } finally {
      setLoading(false);
    }
  }, []); // Dependency rỗng vì hàm này không phụ thuộc vào props hay state nào

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // useEffect để xử lý sự kiện real-time từ socket
  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (userId: string) => {
      setOnlineFriends(prev => new Set(prev).add(userId));
    };
    const handleUserOffline = (userId: string) => {
      setOnlineFriends(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };
    const handleOnlineFriends = (onlineIds: string[]) => {
      setOnlineFriends(new Set(onlineIds));
    };

    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('onlineFriends', handleOnlineFriends);

    // Gửi yêu cầu lấy danh sách bạn bè đang online khi kết nối
    // Bạn có thể thêm một điều kiện để chỉ emit khi friends.length > 0
    socket.emit('getOnlineFriends', friends.map(f => f._id));

    return () => {
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('onlineFriends', handleOnlineFriends);
    };
  }, [socket, friends]); // Thêm `friends` vào dependency để gửi lại danh sách ID khi nó thay đổi

  const handleFriendClick = (friend: IFriendInfo) => {
    openChat({
      id: friend._id,
      name: friend.username,
      avatar: friend.avatar,
    });
  };

  if (loading) {
    return (
      <div className={styles.widget}>
        <h3><FaUsers /> Trò chuyện</h3>
        <div className={styles.empty}>
          <AiOutlineLoading3Quarters className={`${styles.icon} ${styles.spinner}`} />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <h3><FaUsers /> Trò chuyện</h3>
      <ul className={styles.list}>
        <FriendListItem
          key={chatBotUser._id}
          friend={chatBotUser}
          isOnline={true}
          onClick={handleFriendClick}
        />
        {friends.length > 0 ? (
          friends.map((friend) => (
            <FriendListItem
              key={friend._id}
              friend={friend}
              isOnline={onlineFriends.has(friend._id)}
              onClick={handleFriendClick}
            />
          ))
        ) : (
          <div className={styles.empty}>
            <FaUsersSlash className={styles.icon} />
            <span>Chưa có bạn bè nào.</span>
          </div>
        )}
      </ul>
    </div>
  );
}