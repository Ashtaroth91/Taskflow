/**
 * Safe LocalStorage wrapper with error catching for disabled/blocked storage
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`LocalStorage read error for key "${key}":`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`LocalStorage write error for key "${key}":`, e);
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`LocalStorage remove error for key "${key}":`, e);
    }
  },
};
