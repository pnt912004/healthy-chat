import api from './api';

const foodService = {
  searchFoods: async (query = '', category = '', limit = 20, offset = 0) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    params.append('limit', limit);
    params.append('offset', offset);
    
    const response = await api.get(`/api/v1/foods/search?${params.toString()}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/api/v1/foods/categories');
    return response.data;
  },

  getFoodById: async (id) => {
    const response = await api.get(`/api/v1/foods/${id}`);
    return response.data;
  },

  aiEstimateFood: async (query) => {
    const response = await api.post('/api/v1/foods/ai-estimate', { query });
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get('/api/v1/foods/favorites');
    return response.data;
  },

  addFavorite: async (foodId) => {
    const response = await api.post('/api/v1/foods/favorites', { food_id: foodId });
    return response.data;
  },

  removeFavorite: async (foodId) => {
    const response = await api.delete(`/api/v1/foods/favorites/${foodId}`);
    return response.data;
  }
};

export default foodService;
