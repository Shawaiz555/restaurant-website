/**
 * Image Service
 * Handles local image storage using base64 encoding
 */

class ImageService {
  STORAGE_KEY = 'product_images';

  /**
   * Upload image file and store as base64
   * @param {File} file - Image file
   * @param {string} productId - Unique product identifier
   * @returns {Promise<{success: boolean, imageUrl?: string, message?: string}>}
   */
  uploadImage(file, productId) {
    return new Promise((resolve) => {
      // Validate file
      if (!file) {
        resolve({ success: false, message: 'No file provided' });
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        resolve({
          success: false,
          message: 'Invalid file type. Please upload JPG, PNG, WEBP, or GIF'
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        resolve({
          success: false,
          message: 'File too large. Maximum size is 5MB'
        });
        return;
      }

      // Read file as base64
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const base64String = e.target.result;

          // Store image with product ID
          this.saveImageToStorage(productId, base64String);

          resolve({
            success: true,
            imageUrl: base64String
          });
        } catch (error) {
          resolve({
            success: false,
            message: 'Failed to process image'
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Failed to read image file'
        });
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Save image to localStorage
   * @param {string} productId
   * @param {string} base64String
   */
  saveImageToStorage(productId, base64String) {
    try {
      const images = this.getAllImages();
      images[productId] = base64String;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Failed to save image to storage:', error);
    }
  }

  /**
   * Get image by product ID
   * @param {string} productId
   * @returns {string|null}
   */
  getImage(productId) {
    try {
      const images = this.getAllImages();
      return images[productId] || null;
    } catch (error) {
      console.error('Failed to get image:', error);
      return null;
    }
  }

  /**
   * Get all images
   * @returns {Object}
   */
  getAllImages() {
    try {
      const imagesJson = localStorage.getItem(this.STORAGE_KEY);
      return imagesJson ? JSON.parse(imagesJson) : {};
    } catch (error) {
      console.error('Failed to get images:', error);
      return {};
    }
  }

  /**
   * Delete image by product ID
   * @param {string} productId
   * @returns {boolean}
   */
  deleteImage(productId) {
    try {
      const images = this.getAllImages();
      delete images[productId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
      return true;
    } catch (error) {
      console.error('Failed to delete image:', error);
      return false;
    }
  }

  /**
   * Clear all images
   */
  clearAllImages() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear images:', error);
    }
  }
}

export default new ImageService();
