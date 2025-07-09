// font-end/src/Pages/Notifications/NotificationsPage.tsx
import FriendRequests from '../Friend/FriendRequests';
import Navbar from '../../Components/navbar/navbar'; // Import Navbar để trang có bố cục đầy đủ
import styles from './NotificationsPage.module.scss';

export default function NotificationsPage() {
    return (
        <div>
            <Navbar />
            <div className={styles.pageContainer}>
                <h1>Trung tâm thông báo</h1>
                <div className={styles.section}>
                    {/* Trong tương lai bạn có thể thêm các loại thông báo khác ở đây */}
                    <FriendRequests />
                </div>
            </div>
        </div>
    );
}