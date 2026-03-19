import apiClient from './apiClient';

class PaymentService {
  async getPayments(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.method && params.method !== 'All') query.append('method', params.method);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const qs = query.toString();
    return apiClient.get(`/payments${qs ? `?${qs}` : ''}`);
  }

  async getPaymentById(id) {
    return apiClient.get(`/payments/${id}`);
  }

  async createPayment(data) {
    return apiClient.post('/payments', data);
  }

  async updatePayment(id, data) {
    return apiClient.put(`/payments/${id}`, data);
  }

  async deletePayment(id) {
    return apiClient.delete(`/payments/${id}`);
  }

  async getSummary() {
    return apiClient.get('/payments/stats/summary');
  }
}

const paymentService = new PaymentService();
export default paymentService;
