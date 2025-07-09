import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { NavigateFunction } from "react-router-dom";
import styles from "./Navbar.module.scss";
import { FaSearch, FaUserFriends, FaCommentDots } from "react-icons/fa";
import FriendRequests from "../../Pages/Friend/FriendRequests";
import NotificationDropdown from "./NotificationDropdown";

// Interface cho User, Group, và kết quả tìm kiếm
interface ISearchUser {
  _id: string;
  username: string;
  avatar?: string;
}
interface ISearchGroup {
  _id: string;
  name: string;
}
interface ISearchResults {
  users: ISearchUser[];
  groups: ISearchGroup[];
}
interface SearchResultsProps {
  results: ISearchResults;
  navigate: NavigateFunction;
}
interface IUser {
    _id: string;
    username:string;
    avatar?: string;
    acceptFriend?: string[];
}

// Component con để hiển thị kết quả tìm kiếm
const SearchResultsDropdown = ({ results, navigate }: SearchResultsProps) => (
  <div className={styles.searchResultsDropdown}>
    {results.users?.length > 0 && <h4>Mọi người</h4>}
    {results.users.map((user) => (
        <div 
            key={user._id} 
            className={styles.resultItem} 
            onMouseDown={() => navigate(`/user/${user._id}`)}
        >
            <img src={user.avatar || '/default-avatar.png'} alt="avatar"/>
            <span>{user.username}</span>
        </div>
      ))}
      {results.groups?.length > 0 && <h4>Nhóm</h4>}
      {results.groups.map((group) => (
        <div key={group._id} className={styles.resultItem} onMouseDown={() => navigate(`/group/${group._id}`)}>
            <span>{group.name}</span>
        </div>
      ))}
    </div>
);

export default function Navbar() {
  const [user, setUser] = useState<IUser | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [showRequests, setShowRequests] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ISearchResults>({ users: [], groups: [] });
  const [showResults, setShowResults] = useState(false);

  const requestsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Hook để đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (requestsRef.current && !requestsRef.current.contains(event.target as Node)) {
        setShowRequests(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:9090/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const responseData = await res.json();
        const currentUser = responseData.data;
        setUser(currentUser);
        setRequestCount(currentUser.acceptFriend?.length || 0);
      } catch (error) { console.error(error); }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setShowResults(false); return; }
    const debounce = setTimeout(async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:9090/search?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setResults(data);
      setShowResults(true);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query]);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => navigate("/home")}>🎯 SocialApp</div>
        
        <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Tìm kiếm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
            {showResults && <SearchResultsDropdown results={results} navigate={navigate} />}
        </div>
        
        <div className={styles.navLinks}>
            {/* Icon Tin nhắn */}
            <div className={styles.iconWrapper} onClick={() => navigate('/messenger')}>
                 <FaCommentDots className={styles.navIcon} />
            </div>

            {/* Dropdown Lời mời kết bạn */}
            <div className={styles.iconWrapper} ref={requestsRef}>
              <FaUserFriends className={styles.navIcon} onClick={() => setShowRequests(!showRequests)} />
              {requestCount > 0 && <span className={styles.badge}>{requestCount}</span>}
              {showRequests && (
                <div className={styles.requestsDropdown}>
                  <FriendRequests />
                </div>
              )}
            </div>

            {/* Dropdown Thông báo chung */}
            <NotificationDropdown />

            {/* Menu Profile */}
            <div className={styles.profileContainer} ref={profileRef}>
                <div className={styles.profile} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                    <img src={user?.avatar || "/default-avatar.png"} alt="avatar" className={styles.avatar}/>
                    <span>{user?.username || "Profile"}</span>
                </div>
                {showProfileMenu && (
                    <div className={styles.profileDropdown}>
                        <div className={styles.dropdownItem} onClick={() => navigate('/profile')}>Xem hồ sơ</div>
                        <div className={styles.dropdownItem} onClick={handleLogout}>Đăng xuất</div>
                    </div>
                )}
            </div>
        </div>
    </nav>
  );
}