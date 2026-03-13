import apiClient from './apiClient';

class PurchasesService {
  async getPurchases(filters = {}) {
    const params = new URLSearchParams();
    if (filters.supplierId) params.append('supplierId', filters.supplierId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/purchases${query}`);
  }

  async getPurchaseById(id) {
    return apiClient.get(`/purchases/${id}`);
  }

  async createPurchase(data) {
    return apiClient.post('/purchases', data);
  }

  async deletePurchase(id) {
    return apiClient.delete(`/purchases/${id}`);
  }

  async getPurchaseStats() {
    return apiClient.get('/purchases/stats');
  }
}

const purchasesService = new PurchasesService();
export default purchasesService;
