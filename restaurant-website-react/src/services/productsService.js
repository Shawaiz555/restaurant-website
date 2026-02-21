import { getAllProducts } from '../store/productsData';

class ProductsService {
  // Check if products have been migrated to localStorage
  isInitialized() {
    return localStorage.getItem('productsInitialized') === 'true';
  }

  // Migrate products from static file to localStorage (one-time)
  migrateProductsToLocalStorage() {
    if (!this.isInitialized()) {
      const staticProducts = getAllProducts();
      localStorage.setItem('products', JSON.stringify(staticProducts));
      localStorage.setItem('productsInitialized', 'true');
      console.log('Products migrated to localStorage');
      return true;
    }
    return false;
  }

  // Get all products (from localStorage or fallback to static)
  getProducts() {
    try {
      if (this.isInitialized()) {
        const products = localStorage.getItem('products');
        return products ? JSON.parse(products) : [];
      }
      // Fallback to static products if not initialized
      return getAllProducts();
    } catch (error) {
      console.error('Error reading products:', error);
      return getAllProducts();
    }
  }

  // Get single product by ID
  getProductById(productId) {
    const products = this.getProducts();
    return products.find((p) => p.id === productId);
  }

  // Get products by category
  getProductsByCategory(category) {
    const products = this.getProducts();
    return products.filter((p) => p.category === category);
  }

  // Get all categories
  getCategories() {
    const products = this.getProducts();
    return [...new Set(products.map((p) => p.category))];
  }

  // Save products to localStorage
  saveProducts(products) {
    try {
      localStorage.setItem('products', JSON.stringify(products));
      localStorage.setItem('productsInitialized', 'true');
      return true;
    } catch (error) {
      console.error('Error saving products:', error);
      return false;
    }
  }

  // Generate product ID from name
  generateProductId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Validate product data
  validateProduct(product) {
    const errors = [];

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (!product.category || product.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (!product.image || product.image.trim().length === 0) {
      errors.push('Image URL is required');
    }

    if (!product.basePrice || parseFloat(product.basePrice) <= 0) {
      errors.push('Base price must be a positive number');
    }

    if (!product.sizes || product.sizes.length === 0) {
      errors.push('At least one size is required');
    }

    if (product.sizes) {
      product.sizes.forEach((size, index) => {
        if (!size.name || size.name.trim().length === 0) {
          errors.push(`Size ${index + 1}: Name is required`);
        }
        if (!size.price || parseFloat(size.price) <= 0) {
          errors.push(`Size ${index + 1}: Price must be a positive number`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Add new product
  addProduct(productData) {
    const validation = this.validateProduct(productData);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors.join(', '),
        errors: validation.errors,
      };
    }

    const products = this.getProducts();

    // Generate ID if not provided
    const newProduct = {
      ...productData,
      id: productData.id || this.generateProductId(productData.name),
    };

    // Check if product with same ID exists
    if (products.find((p) => p.id === newProduct.id)) {
      return {
        success: false,
        message: 'A product with this name already exists',
      };
    }

    products.push(newProduct);
    this.saveProducts(products);

    return {
      success: true,
      message: 'Product added successfully',
      product: newProduct,
    };
  }

  // Update existing product
  updateProduct(productId, updates) {
    const validation = this.validateProduct({ id: productId, ...updates });
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors.join(', '),
        errors: validation.errors,
      };
    }

    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === productId);

    if (index === -1) {
      return { success: false, message: 'Product not found' };
    }

    products[index] = { ...products[index], ...updates };
    this.saveProducts(products);

    return {
      success: true,
      message: 'Product updated successfully',
      product: products[index],
    };
  }

  // Delete product
  deleteProduct(productId) {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== productId);

    if (filtered.length === products.length) {
      return { success: false, message: 'Product not found' };
    }

    this.saveProducts(filtered);
    return { success: true, message: 'Product deleted successfully' };
  }

  // Duplicate product
  duplicateProduct(productId) {
    const product = this.getProductById(productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    const duplicated = {
      ...product,
      id: this.generateProductId(product.name + '-copy'),
      name: product.name + ' (Copy)',
    };

    return this.addProduct(duplicated);
  }
}

const productsService = new ProductsService();
export default productsService;
