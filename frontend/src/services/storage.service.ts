import Cookies from 'js-cookie';
import type { User } from '@/types/auth';

// Cookie configuration
const COOKIE_CONFIG = {
  secure: window.location.protocol === 'https:', // Use secure cookies in production
  sameSite: 'strict' as const,
  path: '/',
};

const COOKIE_KEYS = {
  TOKEN: 'elms_auth_token',
  REFRESH_TOKEN: 'elms_refresh_token',
  USER: 'elms_user_data',
  REMEMBER_ME: 'elms_remember_me',
};

class StorageService {
  // Token management - Use cookies for better security
  setToken(token: string, rememberMe: boolean = false): void {
    const expires = rememberMe ? 7 : undefined; // 7 days if remember me, session otherwise
    Cookies.set(COOKIE_KEYS.TOKEN, token, {
      ...COOKIE_CONFIG,
      expires,
    });
  }

  getToken(): string | null {
    return Cookies.get(COOKIE_KEYS.TOKEN) || null;
  }

  removeToken(): void {
    Cookies.remove(COOKIE_KEYS.TOKEN, { path: COOKIE_CONFIG.path });
  }

  // Refresh token management
  setRefreshToken(refreshToken: string, rememberMe: boolean = false): void {
    const expires = rememberMe ? 30 : undefined; // 30 days if remember me
    Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
      ...COOKIE_CONFIG,
      expires,
    });
  }

  getRefreshToken(): string | null {
    return Cookies.get(COOKIE_KEYS.REFRESH_TOKEN) || null;
  }

  removeRefreshToken(): void {
    Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN, { path: COOKIE_CONFIG.path });
  }

  // User data management - Store in cookie for SSR compatibility
  setUser(user: User, rememberMe: boolean = false): void {
    const expires = rememberMe ? 7 : undefined;
    // Store minimal user data in cookie
    Cookies.set(COOKIE_KEYS.USER, JSON.stringify(user), {
      ...COOKIE_CONFIG,
      expires,
    });
  }

  getUser(): User | null {
    const userCookie = Cookies.get(COOKIE_KEYS.USER);
    if (!userCookie) return null;

    try {
      return JSON.parse(userCookie) as User;
    } catch (error) {
      console.error('Failed to parse user data from cookie:', error);
      this.removeUser();
      return null;
    }
  }

  removeUser(): void {
    Cookies.remove(COOKIE_KEYS.USER, { path: COOKIE_CONFIG.path });
  }

  // Remember me preference
  setRememberMe(remember: boolean): void {
    if (remember) {
      Cookies.set(COOKIE_KEYS.REMEMBER_ME, 'true', {
        ...COOKIE_CONFIG,
        expires: 365, // 1 year
      });
    } else {
      this.removeRememberMe();
    }
  }

  getRememberMe(): boolean {
    return Cookies.get(COOKIE_KEYS.REMEMBER_ME) === 'true';
  }

  removeRememberMe(): void {
    Cookies.remove(COOKIE_KEYS.REMEMBER_ME, { path: COOKIE_CONFIG.path });
  }

  // Clear all auth data
  clearAuthData(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
    // Keep remember me preference
  }

  // Check if user has valid auth session
  hasValidSession(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Generic cookie methods
  setCookie(key: string, value: string, expires?: number): void {
    Cookies.set(key, value, {
      ...COOKIE_CONFIG,
      expires,
    });
  }

  getCookie(key: string): string | undefined {
    return Cookies.get(key);
  }

  removeCookie(key: string): void {
    Cookies.remove(key, { path: COOKIE_CONFIG.path });
  }

  // Clear all cookies
  clearAllCookies(): void {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName, { path: COOKIE_CONFIG.path });
    });
  }
}

export const storageService = new StorageService();
export default storageService;
