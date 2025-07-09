// File: apps/web/src/App.tsx

import { Route, Routes } from 'react-router-dom';

// Import các trang
import Login from './Pages/auth/Login/Login';
import Register from './Pages/auth/Register/Register';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';
import Home from './Pages/Home/Home';
import ProfileUser from './Pages/Profile/ProfileUser';
import ResetPassword from './Pages/ForgotPassword/ResetPassword';
import VerifyOtp from './Pages/OTP/VerifyOtp';
import InterestSelection from './Pages/Interests/SelectInterests';
import EditProfile from './Pages/Profile/EditProfile';
import GroupPage from './Pages/Group/GroupPage';
import NotificationsPage from './Pages/Notifications/NotificationsPage';
import ChatContainer from './Components/Chat/ChatContainer';
import UserProfilePage from './Pages/Profile/UserProfilePage';
import MessengerPage from './Pages/messenger/MessengerPage';

const App = () => {
  return (
    // Xóa bỏ tất cả các Provider khỏi đây
    <div className="App">
      {/* Các component như Navbar sẽ được gọi bên trong từng trang (Home, ProfileUser,...) */}
      <Routes>
        {/* Các Route cho xác thực */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path='/select-interest' element={<InterestSelection />} />
        
        {/* Các Route chính của ứng dụng */}
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<ProfileUser />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/group/:groupId" element={<GroupPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/user/:userId" element={<UserProfilePage />} />

        {/* === ROUTE CHO TRANG MESSENGER === */}
        <Route path="/messenger" element={<MessengerPage />} />
        
        {/* Route mặc định */}
        <Route path="/" element={<Home />} /> 
      </Routes>
      
      {/* ChatContainer luôn hiển thị ở góc màn hình */}
      <ChatContainer />
    </div>
  );
};

export default App;
