import apiClient from './apiClient';

class ReservationsService {
  async createReservation(data) {
    try {
      const response = await apiClient.post('/reservations', data);
      return { success: true, message: response.message, reservation: response.reservation, emailStatus: response.emailStatus };
    } catch (error) {
      console.error('Create reservation error:', error);
      return { success: false, message: error.message };
    }
  }

  async getReservations(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reservations?${queryParams}` : '/reservations';
      const response = await apiClient.get(endpoint);
      return response.reservations || [];
    } catch (error) {
      console.error('Get reservations error:', error);
      throw error;
    }
  }

  async getReservationStats() {
    try {
      const response = await apiClient.get('/reservations/stats');
      return response.stats || {};
    } catch (error) {
      console.error('Get reservation stats error:', error);
      return {};
    }
  }

  async getMyReservations() {
    try {
      const response = await apiClient.get('/reservations/my');
      return response.reservations || [];
    } catch (error) {
      console.error('Get my reservations error:', error);
      throw error;
    }
  }

  async getReservationById(id) {
    try {
      const response = await apiClient.get(`/reservations/${id}`);
      return { success: true, reservation: response.reservation };
    } catch (error) {
      console.error('Get reservation by id error:', error);
      return { success: false, message: error.message };
    }
  }

  async updateReservationStatus(id, status, note = '') {
    try {
      const response = await apiClient.put(`/reservations/${id}/status`, { status, note });
      return { success: true, message: response.message, reservation: response.reservation };
    } catch (error) {
      console.error('Update reservation status error:', error);
      return { success: false, message: error.message };
    }
  }

  async cancelMyReservation(id) {
    try {
      const response = await apiClient.put(`/reservations/${id}/cancel`, {});
      return { success: true, message: response.message, reservation: response.reservation };
    } catch (error) {
      console.error('Cancel reservation error:', error);
      return { success: false, message: error.message };
    }
  }

  async getBookedTimes(date) {
    try {
      const response = await apiClient.get(`/reservations/booked-times?date=${date}`);
      return response.bookedTimes || [];
    } catch (error) {
      console.error('Get booked times error:', error);
      return [];
    }
  }

  async deleteReservation(id) {
    try {
      const response = await apiClient.delete(`/reservations/${id}`);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Delete reservation error:', error);
      return { success: false, message: error.message };
    }
  }

  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  formatTime(timeStr) {
    if (!timeStr) return '—';
    try {
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  }

  getStatusStyle(status) {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      Confirmed: 'bg-green-100 text-green-800 border border-green-200',
      Cancelled: 'bg-red-100 text-red-800 border border-red-200',
      Completed: 'bg-blue-100 text-blue-800 border border-blue-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  }
}

const reservationsService = new ReservationsService();
export default reservationsService;
