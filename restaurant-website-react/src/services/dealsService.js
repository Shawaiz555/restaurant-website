import apiClient from './apiClient';

class DealsService {
  async getDeals(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const endpoint = params ? `/deals?${params}` : '/deals';
      const response = await apiClient.get(endpoint);
      return response.deals || [];
    } catch (error) {
      console.error('Get deals error:', error);
      throw error;
    }
  }

  async getDealById(id) {
    try {
      const response = await apiClient.get(`/deals/${id}`);
      return response.deal;
    } catch (error) {
      console.error('Get deal error:', error);
      throw error;
    }
  }

  async createDeal(dealData) {
    try {
      const response = await apiClient.post('/deals', dealData);
      return { success: true, message: response.message, deal: response.deal };
    } catch (error) {
      console.error('Create deal error:', error);
      return { success: false, message: error.message };
    }
  }

  async updateDeal(id, dealData) {
    try {
      const response = await apiClient.put(`/deals/${id}`, dealData);
      return { success: true, message: response.message, deal: response.deal };
    } catch (error) {
      console.error('Update deal error:', error);
      return { success: false, message: error.message };
    }
  }

  async toggleDeal(id) {
    try {
      const response = await apiClient.request(`/deals/${id}/toggle`, { method: 'PATCH' });
      return { success: true, message: response.message, deal: response.deal };
    } catch (error) {
      console.error('Toggle deal error:', error);
      return { success: false, message: error.message };
    }
  }

  async deleteDeal(id) {
    try {
      const response = await apiClient.delete(`/deals/${id}`);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Delete deal error:', error);
      return { success: false, message: error.message };
    }
  }
}

const dealsService = new DealsService();
export default dealsService;
