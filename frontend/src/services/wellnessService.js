import api from './api';

// Sleep Logs
export const addSleepLog = async (data) => {
  const response = await api.post('/api/v1/wellness/sleep', data);
  return response.data;
};

export const getSleepLogs = async (date = null) => {
  const url = date ? `/api/v1/wellness/sleep?log_date=${date}` : '/api/v1/wellness/sleep';
  const response = await api.get(url);
  return response.data;
};

export const deleteSleepLog = async (id) => {
  const response = await api.delete(`/api/v1/wellness/sleep/${id}`);
  return response.data;
};

export const getSleepSummary = async () => {
  const response = await api.get('/api/v1/wellness/sleep/summary');
  return response.data;
};

// Mood Logs
export const addMoodLog = async (data) => {
  const response = await api.post('/api/v1/wellness/mood', data);
  return response.data;
};

export const getMoodLogs = async (date = null) => {
  const url = date ? `/api/v1/wellness/mood?log_date=${date}` : '/api/v1/wellness/mood';
  const response = await api.get(url);
  return response.data;
};

export const deleteMoodLog = async (id) => {
  const response = await api.delete(`/api/v1/wellness/mood/${id}`);
  return response.data;
};

// Insights
export const getWellnessInsights = async () => {
  const response = await api.get('/api/v1/wellness/insights');
  return response.data;
};
