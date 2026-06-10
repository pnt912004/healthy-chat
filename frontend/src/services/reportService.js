import api from './api';

export const reportService = {
  getWeeklyReport: async (date = null) => {
    const params = date ? { target_date: date } : {};
    const response = await api.get('/reports/weekly', { params });
    return response.data;
  },

  getMonthlyReport: async (month = null, year = null) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/reports/monthly', { params });
    return response.data;
  },

  getComparison: async (period1Start, period1End, period2Start, period2End) => {
    const response = await api.get('/reports/comparison', {
      params: {
        period1_start: period1Start,
        period1_end: period1End,
        period2_start: period2Start,
        period2_end: period2End,
      }
    });
    return response.data;
  },

  getHealthScore: async (date = null) => {
    const params = date ? { target_date: date } : {};
    const response = await api.get('/reports/score', { params });
    return response.data;
  },

  getAIReview: async (date = null) => {
    const params = date ? { target_date: date } : {};
    const response = await api.post('/reports/ai-review', null, { params });
    return response.data;
  }
};
