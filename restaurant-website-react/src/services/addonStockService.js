import apiClient from './apiClient';

class AddonStockService {
  async getAddonStocks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.addonType && filters.addonType !== 'All') params.append('addonType', filters.addonType);
    if (filters.lowStock) params.append('lowStock', 'true');
    if (filters.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/addon-stocks${query}`);
  }

  async getAddonStockStats() {
    return apiClient.get('/addon-stocks/stats');
  }

  async getAddonStockById(id) {
    return apiClient.get(`/addon-stocks/${id}`);
  }

  async createAddonStock(data) {
    return apiClient.post('/addon-stocks', data);
  }

  async updateAddonStock(id, data) {
    return apiClient.put(`/addon-stocks/${id}`, data);
  }

  async deleteAddonStock(id) {
    return apiClient.delete(`/addon-stocks/${id}`);
  }

  getAddonTypes() {
    return ['Drink', 'Dessert', 'Extra'];
  }

  getUnits() {
    return ['pcs', 'ml', 'L', 'g', 'kg', 'cups'];
  }
}

const addonStockService = new AddonStockService();
export default addonStockService;
