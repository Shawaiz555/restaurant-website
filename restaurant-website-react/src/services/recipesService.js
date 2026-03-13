import apiClient from './apiClient';

class RecipesService {
  async getRecipes() {
    return apiClient.get('/recipes');
  }

  async getRecipeByProductId(productId) {
    return apiClient.get(`/recipes/product/${productId}`);
  }

  async saveRecipe(data) {
    return apiClient.post('/recipes', data);
  }

  async deleteRecipe(id) {
    return apiClient.delete(`/recipes/${id}`);
  }
}

const recipesService = new RecipesService();
export default recipesService;
