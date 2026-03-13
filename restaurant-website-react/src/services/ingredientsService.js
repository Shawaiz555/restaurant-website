import apiClient from './apiClient';

class IngredientsService {
  async getIngredients(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.lowStock) params.append('lowStock', 'true');
    if (filters.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/ingredients${query}`);
  }

  async getLowStockIngredients() {
    return apiClient.get('/ingredients/low-stock');
  }

  async getIngredientStats() {
    return apiClient.get('/ingredients/stats');
  }

  async getIngredientById(id) {
    return apiClient.get(`/ingredients/${id}`);
  }

  async createIngredient(data) {
    return apiClient.post('/ingredients', data);
  }

  async updateIngredient(id, data) {
    return apiClient.put(`/ingredients/${id}`, data);
  }

  async deleteIngredient(id) {
    return apiClient.delete(`/ingredients/${id}`);
  }

  getCategories() {
    return ['Produce', 'Meat', 'Dairy', 'Spices', 'Grains', 'Beverages', 'Other'];
  }

  getUnits() {
    return ['g', 'kg', 'ml', 'L', 'pcs', 'cups', 'tbsp', 'tsp'];
  }
}

const ingredientsService = new IngredientsService();
export default ingredientsService;
