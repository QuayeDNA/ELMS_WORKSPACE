import { STORAGE_KEYS } from '@/utils/constants';

class StorageService {
  private isElectron = typeof window !== 'undefined' && window.electronAPI;

  // Store data securely (Electron keychain or localStorage fallback)
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isElectron) {
        // Use Electron's secure storage
        await window.electronAPI?.store?.set(key, value);
      } else {
        // Fallback to localStorage for web
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Failed to store item:', error);
      // Fallback to localStorage
      localStorage.setItem(key, value);
    }
  }

  // Retrieve data securely
  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isElectron) {
        // Use Electron's secure storage
        const value = await window.electronAPI?.store?.get(key);
        // Ensure we return null instead of undefined
        return value !== undefined ? value : null;
      } else {
        // Fallback to localStorage for web
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      // Fallback to localStorage
      return localStorage.getItem(key);
    }
  }

  // Remove data
  async removeItem(key: string): Promise<void> {
    try {
      if (this.isElectron) {
        // Use Electron's secure storage
        await window.electronAPI?.store?.delete(key);
      } else {
        // Fallback to localStorage for web
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      // Fallback to localStorage
      localStorage.removeItem(key);
    }
  }

  // Clear all storage
  async clear(): Promise<void> {
    try {
      if (this.isElectron) {
        // Clear specific ELMS keys from Electron storage
        await Promise.all([
          this.removeItem(STORAGE_KEYS.TOKEN),
          this.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
          this.removeItem(STORAGE_KEYS.USER),
          this.removeItem(STORAGE_KEYS.REMEMBER_ME),
        ]);
      } else {
        // Clear localStorage
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  // Token management
  async setToken(token: string): Promise<void> {
    console.log('StorageService: Setting token');
    await this.setItem(STORAGE_KEYS.TOKEN, token);
  }

  async getToken(): Promise<string | null> {
    const token = await this.getItem(STORAGE_KEYS.TOKEN);
    console.log('StorageService: Getting token, exists:', !!token);
    return token;
  }

  async setRefreshToken(refreshToken: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async setUser(user: Record<string, unknown>): Promise<void> {
    console.log('StorageService: Setting user data:', user);
    await this.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  async getUser(): Promise<Record<string, unknown> | null> {
    try {
      const userData = await this.getItem(STORAGE_KEYS.USER);
      console.log('StorageService: Getting user data, raw:', userData);
      
      // Check for null, undefined, or empty string
      if (!userData || userData === 'undefined' || userData === 'null') {
        console.log('StorageService: No valid user data found');
        return null;
      }
      
      const parsed = JSON.parse(userData);
      console.log('StorageService: Parsed user data:', parsed);
      return parsed;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      // Clear corrupted data
      await this.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  }

  async setRememberMe(remember: boolean): Promise<void> {
    await this.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
  }

  async getRememberMe(): Promise<boolean> {
    const remember = await this.getItem(STORAGE_KEYS.REMEMBER_ME);
    return remember === 'true';
  }

  // Clear auth data
  async clearAuthData(): Promise<void> {
    await Promise.all([
      this.removeItem(STORAGE_KEYS.TOKEN),
      this.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      this.removeItem(STORAGE_KEYS.USER),
      this.removeItem(STORAGE_KEYS.REMEMBER_ME),
    ]);
  }

  // Validate and clean corrupted storage
  async validateAndCleanStorage(): Promise<void> {
    try {
      const userData = await this.getItem(STORAGE_KEYS.USER);
      
      // If user data exists but is corrupted, clear all auth data
      if (userData && (userData === 'undefined' || userData === 'null')) {
        console.warn('Corrupted user data detected, clearing auth storage');
        await this.clearAuthData();
      }
      
      // Try to parse user data if it exists
      if (userData && userData !== 'undefined' && userData !== 'null') {
        try {
          JSON.parse(userData);
        } catch (error) {
          console.warn('Invalid JSON in user data, clearing auth storage');
          await this.clearAuthData();
        }
      }
    } catch (error) {
      console.error('Storage validation error:', error);
      // If validation fails, clear auth data to be safe
      await this.clearAuthData();
    }
  }
}

// Declare global types for Electron API
declare global {
  interface Window {
    electronAPI?: {
      store?: {
        get: (key: string) => Promise<string>;
        set: (key: string, value: string) => Promise<void>;
        delete: (key: string) => Promise<void>;
      };
    };
  }
}

export const storageService = new StorageService();
