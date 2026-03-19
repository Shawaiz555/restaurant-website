import apiClient from './apiClient';

class SettingsService {
  async getSettings() {
    return apiClient.get('/settings');
  }

  async updateSettings(data) {
    return apiClient.put('/settings', data);
  }
}

const settingsService = new SettingsService();
export default settingsService;
