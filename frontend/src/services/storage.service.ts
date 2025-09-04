import { STORAGE_KEYS } from '@/utils/constants';
import type { User } from '@/types/auth';

class StorageService {
  // Token management
  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  // Refresh token management
  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  removeRefreshToken(): void {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // User data management
  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Remember me preference
  setRememberMe(remember: boolean): void {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
  }

  getRememberMe(): boolean {
    const remember = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    return remember === 'true';
  }

  removeRememberMe(): void {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }

  // Clear all auth data
  clearAuthData(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
    this.removeRememberMe();
  }

  // Generic storage methods
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

export const storageService = new StorageService();
export default storageService;
