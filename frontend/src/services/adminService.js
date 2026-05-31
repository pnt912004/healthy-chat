import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/api/v1/admin/stats');
  return response.data;
};

// Users
export const getUsers = async (skip = 0, limit = 100, search = '', role = '', is_active = '') => {
  let url = `/api/v1/admin/users?skip=${skip}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (role) url += `&role=${role}`;
  if (is_active !== '') url += `&is_active=${is_active}`;
  const response = await api.get(url);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.patch(`/api/v1/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/v1/admin/users/${id}`);
  return response.data;
};

// Health Tips
export const getTips = async (skip = 0, limit = 100) => {
  const response = await api.get(`/api/v1/admin/tips?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const createTip = async (data) => {
  const response = await api.post('/api/v1/admin/tips', data);
  return response.data;
};

export const updateTip = async (id, data) => {
  const response = await api.put(`/api/v1/admin/tips/${id}`, data);
  return response.data;
};

export const deleteTip = async (id) => {
  const response = await api.delete(`/api/v1/admin/tips/${id}`);
  return response.data;
};

// Admin Chats
export const getAdminChats = async () => {
  const response = await api.get('/api/v1/admin/chats');
  return response.data;
};

export const getAdminChatHistory = async (sessionId) => {
  const response = await api.get(`/api/v1/admin/chats/${sessionId}`);
  return response.data;
};

export const replyToUserChat = async (sessionId, message, userId) => {
  const response = await api.post('/api/v1/admin/chats/reply', {
    session_id: sessionId,
    message,
    user_id: userId
  });
  return response.data;
};

export const getAdminUnreadCount = async () => {
  const response = await api.get('/api/v1/admin/chats/unread');
  return response.data;
};

export const markAdminChatAsRead = async (sessionId) => {
  const response = await api.post(`/api/v1/admin/chats/read/${sessionId}`);
  return response.data;
};
