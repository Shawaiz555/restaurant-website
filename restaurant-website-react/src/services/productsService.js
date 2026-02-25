import apiClient from './apiClient';

class ProductsService {
  // Synchronous method for components that need immediate data (returns empty array, use fetchProducts instead)
  getProducts(category = null) {
    console.warn('getProducts() is deprecated. Use fetchProducts() instead for real-time data.');
    return [];
  }

  // Async method for fetching from API
  async fetchProducts(category = null) {
    try {
      const queryParams = category ? `?category=${category}` : '';
      const response = await apiClient.get(`/products${queryParams}`);
      return response.products || [];
    } catch (error) {
      console.error('Get products error:', error);
      return [];
    }
  }

  // Synchronous method for getting product by ID (deprecated, use fetchProductById)
  getProductById(productId) {
    console.warn('getProductById() is deprecated. Use fetchProductById() instead for real-time data.');
    return null;
  }

  // Async method for fetching product from API
  async fetchProductById(productId) {
    try {
      const response = await apiClient.get(`/products/${productId}`);
      return response.product;
    } catch (error) {
      console.error('Get product error:', error);
      return null;
    }
  }

  getProductsByCategory(category) {
    return this.getProducts(category);
  }

  async fetchProductsByCategory(category) {
    return this.fetchProducts(category);
  }

  async getCategories() {
    try {
      const response = await apiClient.get('/products/categories/list');
      return response.categories || [];
    } catch (error) {
      console.error('Get categories error:', error);
      return [];
    }
  }

  async addProduct(productData) {
    try {
      // Handle image upload if it's a base64 string
      if (productData.image && typeof productData.image === 'string') {
        if (productData.image.startsWith('data:')) {
          const imageId = await this._uploadImage(productData.image);
          if (imageId) {
            productData.imageId = imageId;
            delete productData.image;
          }
        } else if (productData.image.startsWith('http')) {
          productData.imageUrl = productData.image;
          delete productData.image;
        }
      }

      const response = await apiClient.post('/products', productData);
      return {
        success: true,
        message: response.message,
        product: response.product
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async updateProduct(productId, updates) {
    try {
      // Handle image upload if it's a base64 string
      if (updates.image && typeof updates.image === 'string') {
        if (updates.image.startsWith('data:')) {
          const imageId = await this._uploadImage(updates.image);
          if (imageId) {
            updates.imageId = imageId;
            delete updates.image;
          }
        } else if (updates.image.startsWith('http')) {
          updates.imageUrl = updates.image;
          delete updates.image;
        }
      }

      const response = await apiClient.put(`/products/${productId}`, updates);
      return {
        success: true,
        message: response.message,
        product: response.product
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Private helper for uploading images
  async _uploadImage(base64Image) {
    try {
      const formData = new FormData();
      const filename = `product-${Date.now()}.png`;

      // Convert base64 to blob
      const res = await fetch(base64Image);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type });

      formData.append('image', file);
      const response = await apiClient.uploadFile('/images/upload', formData);

      return response.imageId;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  }

  async deleteProduct(productId) {
    try {
      const response = await apiClient.delete(`/products/${productId}`);
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  validateProduct(product) {
    const errors = [];

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (!product.category || product.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (!product.basePrice || isNaN(product.basePrice) || product.basePrice < 0) {
      errors.push('Valid base price is required');
    }

    if (!product.sizes || product.sizes.length === 0) {
      errors.push('At least one size is required');
    }

    return errors;
  }

  // Helper method for generating product ID from name
  generateProductId(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  getImageUrl(product) {
    if (!product) return "https://via.placeholder.com/80x80?text=No+Image";

    // Support both direct image string or product object
    let image = typeof product === "string" ? product : (product.image || product.imageUrl || product.imageId);

    if (!image) return "https://via.placeholder.com/80x80?text=No+Image";

    // Ensure it's a string
    image = image.toString();

    if (image.startsWith("http") || image.startsWith("data:")) return image;

    // Handle relative paths from public folder or API images
    const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
    const baseServerURL = baseURL.replace("/api", "");

    if (image.startsWith("/api/images")) {
      return `${baseServerURL}${image}`;
    }

    // Default GridFS path if it's just an ID
    if (/^[0-9a-fA-F]{24}$/.test(image)) {
      return `${baseURL}/images/${image}`;
    }

    return image;
  }
}

const productsService = new ProductsService();
export default productsService;
