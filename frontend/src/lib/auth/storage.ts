/**
 * Authentication storage utilities
 */

import Cookies from 'js-cookie';
import { AuthTokens, User } from './types';

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const authStorage = {
  // Token management
  setTokens(tokens: AuthTokens): void {
    try {
      // Store access token in memory/localStorage for short-term use
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('tokenExpiresAt', tokens.expiresAt.toString());
      
      // Store refresh token in secure httpOnly cookie (if possible) or localStorage
      if (typeof window !== 'undefined') {
        // For development, store in localStorage
        // In production, this should be handled by the server setting httpOnly cookies
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        // Also set as secure cookie if possible
        Cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
          expires: 30, // 30 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }
    } catch (error) {
      console.error('Failed to store auth tokens:', error);
    }
  },

  getTokens(): AuthTokens | null {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken') || Cookies.get(REFRESH_TOKEN_KEY);
      const expiresAt = localStorage.getItem('tokenExpiresAt');

      if (accessToken && refreshToken && expiresAt) {
        return {
          accessToken,
          refreshToken,
          expiresAt: parseInt(expiresAt, 10),
        };
      }
    } catch (error) {
      console.error('Failed to retrieve auth tokens:', error);
    }
    return null;
  },

  clearTokens(): void {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
      Cookies.remove(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
    }
  },

  // User management
  setUser(user: User): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  },

  getUser(): User | null {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  },

  clearUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  },

  // Utility functions
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  },

  getAccessToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken') || Cookies.get(REFRESH_TOKEN_KEY) || null;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  },

  // Clear all auth data
  clearAll(): void {
    this.clearTokens();
    this.clearUser();
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;
    
    // Check if access token is expired
    if (this.isTokenExpired(tokens.expiresAt)) {
      // Token is expired, but we might be able to refresh it
      return !!this.getRefreshToken();
    }
    
    return true;
  },
};
