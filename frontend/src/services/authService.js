import api from './api';

export const login = async (username, password) => {
  const response = await api.post('/api/v1/auth/login', { username, password });
  if (response.data.access_token) {
    localStorage.setItem('hc_token', response.data.access_token);
    localStorage.setItem('hc_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/api/v1/auth/register', userData);
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
