// File: apps/web/src/Pages/auth/Login/Login.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- PHẦN IMPORT MỚI ---
import { useAuthContext } from '../../../Context/AuthContext'; // 1. Import hook mới
import { login } from '../../../Api/Auth'; // Import hàm login từ API layer

// --- PHẦN IMPORT CŨ ---
import AuthFormWrapper from '../../../Components/AuthFormWrapper';
import styles from './Login.module.scss';

export default function Login() {
  // --- LẤY HÀM setAuthUser TỪ CONTEXT ---
  const { setAuthUser } = useAuthContext(); // 2. Lấy hàm cập nhật state từ context

  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- HÀM XỬ LÝ ĐĂNG NHẬP ĐÃ ĐƯỢC NÂNG CẤP ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setSuccess('');
    setLoading(true);

    try {
      // Hàm login từ Api/Auth.ts của bạn đã tự động lưu token vào localStorage
      const responseData = await login({ email: form.email, password: form.password });

      // 3. CẬP NHẬT TRẠNG THÁI TOÀN CỤC
      // Báo cho toàn bộ ứng dụng biết người dùng đã đăng nhập là ai
      setAuthUser(responseData.user);

      setSuccess('✅ Đăng nhập thành công!');

      // 4. CHUYỂN HƯỚNG NGAY LẬP TỨC - KHÔNG CẦN TẢI LẠI TRANG
      // React sẽ tự động cập nhật giao diện (ví dụ: Navbar) vì state trong context đã thay đổi
      const hasInterests = responseData.user.interest_id && responseData.user.interest_id.length > 0;
      if (hasInterests) {
        navigate('/home');
      } else {
        navigate('/select-interest');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Interceptor trong api.ts đã trả về lỗi, chúng ta chỉ cần hiển thị
      setErr(error?.message || '❌ Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  // --- PHẦN JSX GIỮ NGUYÊN ---
  return (
    <div className={styles.loginPage}>
      <div className={styles.card}>
        <div className={styles.left}>
          <h1>Kết nối & Giao tiếp</h1>
          <p>Khám phá cộng đồng sống động và đầy cảm hứng!</p>
          <div className={styles.buttonsRegister}>
            <button onClick={() => navigate('/register')}>Tạo tài khoản</button>
          </div>
        </div>
        <div className={styles.right}>
          <AuthFormWrapper title="Đăng Nhập">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {err && <p className={styles.errorMessage}>{err}</p>}
              {success && <p className={styles.successMessage}>{success}</p>}

              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
              />
              <input
                name="password"
                type="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="current-password"
              />

              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
              </motion.button>

              <div className={styles.links}>
                <span onClick={() => navigate('/forgot-password')}>
                  Quên mật khẩu?
                </span>
              </div>
            </motion.form>
          </AuthFormWrapper>
        </div>
      </div>
    </div>
  );
}