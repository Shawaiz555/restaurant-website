import apiClient from './apiClient';

class TablesService {
  async getTables(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/tables?${queryParams}` : '/tables';
      const response = await apiClient.get(endpoint);
      return response.tables || [];
    } catch (error) {
      console.error('Get tables error:', error);
      throw error;
    }
  }

  async getAvailableTables({ date, time, partySize } = {}) {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (time) params.append('time', time);
      if (partySize) params.append('partySize', partySize);
      const response = await apiClient.get(`/tables/available?${params.toString()}`);
      return response.tables || [];
    } catch (error) {
      console.error('Get available tables error:', error);
      throw error;
    }
  }

  async getTableById(id) {
    try {
      const response = await apiClient.get(`/tables/${id}`);
      return response.table;
    } catch (error) {
      console.error('Get table error:', error);
      throw error;
    }
  }

  async createTable(tableData) {
    try {
      const response = await apiClient.post('/tables', tableData);
      return { success: true, message: response.message, table: response.table };
    } catch (error) {
      console.error('Create table error:', error);
      return { success: false, message: error.message };
    }
  }

  async updateTable(id, tableData) {
    try {
      const response = await apiClient.put(`/tables/${id}`, tableData);
      return { success: true, message: response.message, table: response.table };
    } catch (error) {
      console.error('Update table error:', error);
      return { success: false, message: error.message };
    }
  }

  async deleteTable(id) {
    try {
      const response = await apiClient.delete(`/tables/${id}`);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Delete table error:', error);
      return { success: false, message: error.message };
    }
  }

  getLocationLabel(location) {
    const labels = {
      Indoor: { label: 'Indoor', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      Outdoor: { label: 'Outdoor', color: 'bg-green-100 text-green-800 border-green-200' },
      VIP: { label: 'VIP', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      Bar: { label: 'Bar', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    };
    return labels[location] || { label: location, color: 'bg-gray-100 text-gray-800 border-gray-200' };
  }

  getStatusStyle(status) {
    const styles = {
      Available: 'bg-green-100 text-green-800 border-green-200',
      Reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Maintenance: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

const tablesService = new TablesService();
export default tablesService;
