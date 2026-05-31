import api from './api';

export const sendMessage = async (message, sessionId = null) => {
  const response = await api.post('/api/v1/chat/send', { message, session_id: sessionId });
  return response.data;
};

export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/api/v1/chat/history/${sessionId}`);
  return response.data;
};

export const getChatSessions = async () => {
  const response = await api.get('/api/v1/chat/sessions');
  return response.data;
};

export const sendMessageToAdmin = async (message, sessionId = null) => {
  const response = await api.post('/api/v1/chat/admin/send', { message, session_id: sessionId });
  return response.data;
};

export const getUserUnreadCount = async () => {
  const response = await api.get('/api/v1/chat/unread');
  return response.data;
};

export const markUserChatAsRead = async (sessionId) => {
  const response = await api.post(`/api/v1/chat/read/${sessionId}`);
  return response.data;
};
