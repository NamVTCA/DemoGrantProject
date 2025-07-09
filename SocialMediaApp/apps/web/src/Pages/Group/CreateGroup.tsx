import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from './CreateGroup.module.scss';

// Định nghĩa props cho component
interface CreateGroupProps {
  onClose: () => void;
  // Thay vì chỉ làm mới, chúng ta sẽ điều hướng đến nhóm mới
  // onGroupCreated: (newGroup: any) => void;
}

// Định nghĩa kiểu dữ liệu cho nhóm được trả về từ API
interface NewGroup {
    _id: string;
    // Thêm các thuộc tính khác nếu cần
}

export default function CreateGroup({ onClose }: CreateGroupProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Sử dụng hook navigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Tên nhóm và mô tả không được để trống.');
      return;
    }
    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login'); // Nếu không có token, điều hướng về trang đăng nhập
        return;
    }

    try {
      // URL này là chính xác cho backend chúng ta đã xây dựng
      const response = await fetch('http://localhost:9090/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Lấy thông báo lỗi từ server nếu có
        throw new Error(data.message || 'Tạo nhóm thất bại, vui lòng thử lại.');
      }

      // Tạo nhóm thành công
      alert('Tạo nhóm thành công!');
      onClose(); // Đóng modal
      navigate(`/group/${data._id}`); // Điều hướng đến trang của nhóm mới

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Dùng onMouseDown thay vì onClick để tránh sự kiện nổi bọt (bubbling) không mong muốn
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div className={styles.modalContent} onMouseDown={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2>Tạo nhóm mới</h2>
          <p>Cùng nhau kết nối và chia sẻ đam mê.</p>

          <div className={styles.formGroup}>
            <label htmlFor="name">Tên nhóm</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Hội yêu Lập trình"
              autoFocus // Tự động focus vào input này khi mở modal
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về mục tiêu và hoạt động của nhóm..."
              rows={4}
            />
          </div>
          
          {error && <p className={styles.error}>{error}</p>}
          
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={isLoading}>
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className={styles.submitBtn}>
              {isLoading ? 'Đang tạo...' : 'Tạo nhóm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}