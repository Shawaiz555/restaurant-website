import apiClient from './apiClient';

class StaffService {
  async getStaff() {
    return apiClient.get('/staff');
  }

  async getStaffById(id) {
    return apiClient.get(`/staff/${id}`);
  }

  async createStaff(data) {
    return apiClient.post('/staff', data);
  }

  async updateStaff(id, data) {
    return apiClient.put(`/staff/${id}`, data);
  }

  async toggleStatus(id) {
    return apiClient.patch(`/staff/${id}/status`);
  }

  async resetPassword(id, newPassword) {
    return apiClient.patch(`/staff/${id}/reset-password`, { newPassword });
  }

  async getLiveSessions() {
    return apiClient.get('/staff/live-sessions');
  }
}

const staffService = new StaffService();
export default staffService;
