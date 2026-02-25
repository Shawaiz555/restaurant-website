import apiClient from './apiClient';

class ImageService {
  // Upload image to GridFS
  async uploadImage(file, productId = null) {
    try {
      // Validate file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        return {
          success: false,
          message: 'Invalid file type. Please upload JPG, PNG, WEBP, or GIF'
        };
      }

      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          message: 'File too large. Maximum size is 5MB'
        };
      }

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      if (productId) {
        formData.append('productId', productId);
      }

      // Upload to server
      const response = await apiClient.uploadFile('/images/upload', formData);

      return {
        success: true,
        imageId: response.imageId,
        filename: response.filename,
        imageUrl: this.getImageUrl(response.imageId)
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload image'
      };
    }
  }

  // Get image URL for GridFS image
  getImageUrl(imageId) {
    if (!imageId) return null;
    return `http://localhost:8000/api/images/${imageId}`;
  }

  // Delete image from GridFS
  async deleteImage(imageId) {
    try {
      const response = await apiClient.delete(`/images/${imageId}`);
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

  // Validate image before upload
  validateImage(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!file) {
      return { valid: false, message: 'No file provided' };
    }

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Invalid file type. Please upload JPG, PNG, WEBP, or GIF'
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        valid: false,
        message: 'File too large. Maximum size is 5MB'
      };
    }

    return { valid: true };
  }

  // Convert file to base64 for preview (client-side only)
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

const imageService = new ImageService();
export default imageService;
