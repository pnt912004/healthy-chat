import api from './api';

export const notificationService = {
  getNotifications: async (skip = 0, limit = 20) => {
    const response = await api.get('/notifications', { params: { skip, limit } });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.post(`/notifications/read/${id}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  getReminderSettings: async () => {
    const response = await api.get('/reminders/settings');
    return response.data;
  },

  updateReminderSettings: async (data) => {
    const response = await api.put('/reminders/settings', data);
    return response.data;
  },

  checkReminders: async () => {
    const response = await api.post('/reminders/check');
    return response.data;
  }
};
