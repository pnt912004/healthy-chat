import api from './api';

// Nutrition
export const getNutritionSummary = async (date = null) => {
  const url = date ? `/api/v1/nutrition/summary?log_date=${date}` : '/api/v1/nutrition/summary';
  const response = await api.get(url);
  return response.data;
};

export const addNutritionLog = async (logData) => {
  const response = await api.post('/api/v1/nutrition/logs', logData);
  return response.data;
};

export const getNutritionLogs = async (date = null) => {
  const url = date ? `/api/v1/nutrition/logs?log_date=${date}` : '/api/v1/nutrition/logs';
  const response = await api.get(url);
  return response.data;
};

export const deleteNutritionLog = async (logId) => {
  const response = await api.delete(`/api/v1/nutrition/logs/${logId}`);
  return response.data;
};

export const updateNutritionLog = async (logId, logData) => {
  const response = await api.put(`/api/v1/nutrition/logs/${logId}`, logData);
  return response.data;
};

export const getNutritionRange = async (startDate, endDate) => {
  const response = await api.get(`/api/v1/nutrition/range?start_date=${startDate}&end_date=${endDate}`);
  return response.data;
};

// Water
export const getWaterWeekly = async (date = null) => {
  const url = date ? `/api/v1/water/weekly?log_date=${date}` : '/api/v1/water/weekly';
  const response = await api.get(url);
  return response.data;
};
export const getWaterSummary = async (date = null) => {
  const url = date ? `/api/v1/water/summary?log_date=${date}` : '/api/v1/water/summary';
  const response = await api.get(url);
  return response.data;
};

export const addWaterLog = async (amountMl) => {
  const response = await api.post('/api/v1/water/logs', { amount_ml: amountMl });
  return response.data;
};

export const deleteWaterLog = async (logId) => {
  const response = await api.delete(`/api/v1/water/logs/${logId}`);
  return response.data;
};

export const getWaterLogs = async (date = null) => {
  const url = date ? `/api/v1/water/logs?log_date=${date}` : '/api/v1/water/logs';
  const response = await api.get(url);
  return response.data;
};

export const getWaterRange = async (startDate, endDate) => {
  const response = await api.get(`/api/v1/water/range?start_date=${startDate}&end_date=${endDate}`);
  return response.data;
};

// Tips
export const getRandomTip = async () => {
  const response = await api.get('/api/v1/tips/random');
  return response.data;
};

// Goals
export const calculateTDEE = async (data) => {
  const response = await api.post('/api/v1/goals/calculate-tdee', data);
  return response.data;
};

export const getGoal = async () => {
  const response = await api.get('/api/v1/goals/me');
  return response.data;
};

export const updateGoal = async (goalData) => {
  const response = await api.put('/api/v1/goals/me', goalData);
  return response.data;
};
