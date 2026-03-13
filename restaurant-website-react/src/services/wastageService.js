import apiClient from './apiClient';

class WastageService {
  async getWastage(filters = {}) {
    const params = new URLSearchParams();
    if (filters.ingredientId) params.append('ingredientId', filters.ingredientId);
    if (filters.reason && filters.reason !== 'All') params.append('reason', filters.reason);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/wastage${query}`);
  }

  async createWastage(data) {
    return apiClient.post('/wastage', data);
  }

  async deleteWastage(id) {
    return apiClient.delete(`/wastage/${id}`);
  }

  async getWastageStats() {
    return apiClient.get('/wastage/stats');
  }

  getReasons() {
    return ['Spoilage', 'Spillage', 'Expired', 'Overcooked', 'Other'];
  }
}

const wastageService = new WastageService();
export default wastageService;
