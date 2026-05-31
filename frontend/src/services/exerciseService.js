import api from './api';

export const getExerciseSummary = async (date = null) => {
  const url = date ? `/api/v1/exercise/summary?log_date=${date}` : '/api/v1/exercise/summary';
  const response = await api.get(url);
  return response.data;
};

export const addExerciseLog = async (logData) => {
  const response = await api.post('/api/v1/exercise/logs', logData);
  return response.data;
};

export const getExerciseLogs = async (date = null) => {
  const url = date ? `/api/v1/exercise/logs?log_date=${date}` : '/api/v1/exercise/logs';
  const response = await api.get(url);
  return response.data;
};

export const deleteExerciseLog = async (logId) => {
  const response = await api.delete(`/api/v1/exercise/logs/${logId}`);
  return response.data;
};

export const getExerciseWeekly = async (date = null) => {
  const url = date ? `/api/v1/exercise/weekly?log_date=${date}` : '/api/v1/exercise/weekly';
  const response = await api.get(url);
  return response.data;
};

export const getExerciseRange = async (startDate, endDate) => {
  const response = await api.get(`/api/v1/exercise/range?start_date=${startDate}&end_date=${endDate}`);
  return response.data;
};
