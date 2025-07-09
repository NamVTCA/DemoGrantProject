import { api } from './api'; // <-- Import instance api tập trung

export const fetchAllInterests = () => {
  return api.get('/interest');
};

export const saveUserInterests = (interestIds: string[]) => {
  // Không cần lấy token thủ công nữa, interceptor sẽ tự làm
  return api.post('/users/set/interests', { interestIds });
};