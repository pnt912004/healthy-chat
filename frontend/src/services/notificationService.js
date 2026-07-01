import api from './api';

export const notificationService = {
  getNotifications: async (skip = 0, limit = 20) => {
    const response = await api.get('/api/v1/notifications', { params: { skip, limit } });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/api/v1/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.post(`/api/v1/notifications/read/${id}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/api/v1/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/api/v1/notifications/${id}`);
    return response.data;
  },

  getReminderSettings: async () => {
    const response = await api.get('/api/v1/reminders/settings');
    return response.data;
  },

  updateReminderSettings: async (data) => {
    const response = await api.put('/api/v1/reminders/settings', data);
    return response.data;
  },

  checkReminders: async () => {
    const response = await api.post('/api/v1/reminders/check');
    return response.data;
  }
};
