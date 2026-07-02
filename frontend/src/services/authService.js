import api from './api';

export const login = async (username, password, captcha_token) => {
  const response = await api.post('/api/v1/auth/login', { username, password, captcha_token });
  if (response.data.access_token) {
    localStorage.setItem('hc_token', response.data.access_token);
    localStorage.setItem('hc_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/api/v1/auth/register', userData);
  // Không lưu token nữa vì backend không trả về access_token cho tới khi xác thực email
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.post('/api/v1/auth/verify-email', { token });
  return response.data;
};

export const googleLogin = async (id_token) => {
  const response = await api.post('/api/v1/auth/google', { id_token });
  if (response.data.access_token) {
    localStorage.setItem('hc_token', response.data.access_token);
    localStorage.setItem('hc_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('hc_token');
  localStorage.removeItem('hc_user');
};

export const updateProfile = async (userData) => {
  const response = await api.put('/api/v1/users/me', userData);
  if (response.data) {
    localStorage.setItem('hc_user', JSON.stringify(response.data));
  }
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/v1/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  if (response.data) {
    localStorage.setItem('hc_user', JSON.stringify(response.data));
  }
  return response.data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('hc_user');
  return user ? JSON.parse(user) : null;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/api/v1/users/me/password', passwordData);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete('/api/v1/users/me');
  return response.data;
};
