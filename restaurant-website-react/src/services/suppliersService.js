import apiClient from './apiClient';

class SuppliersService {
  async getSuppliers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.active !== undefined) params.append('active', filters.active);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/suppliers${query}`);
  }

  async getSupplierById(id) {
    return apiClient.get(`/suppliers/${id}`);
  }

  async createSupplier(data) {
    return apiClient.post('/suppliers', data);
  }

  async updateSupplier(id, data) {
    return apiClient.put(`/suppliers/${id}`, data);
  }

  async deleteSupplier(id) {
    return apiClient.delete(`/suppliers/${id}`);
  }
}

const suppliersService = new SuppliersService();
export default suppliersService;
