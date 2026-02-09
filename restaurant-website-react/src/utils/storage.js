// Local storage helper functions
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage', e);
      return false;
    }
  },
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return null;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage', e);
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing localStorage', e);
      return false;
    }
  }
};

export default storage;
