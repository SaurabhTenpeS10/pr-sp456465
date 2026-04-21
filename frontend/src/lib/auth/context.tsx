/**
 * Authentication context and provider
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  AuthState,
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
  ChangePasswordCredentials,
  User,
  AuthTokens,
} from './types';
import { authApiService } from './api';
import { authStorage } from './storage';

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: User };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Handle unauthorized events dispatched from Axios interceptors
  useEffect(() => {
    const handleSessionExpired = () => {
      authStorage.clearAll();
      dispatch({ type: 'AUTH_LOGOUT' });
      toast.error('Session expire please login again', { duration: 4000 });
      router.push('/auth/login');
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session_expired', handleSessionExpired);
  }, [router]);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const tokens = authStorage.getTokens();
      const user = authStorage.getUser();

      if (tokens && user && !authStorage.isTokenExpired(tokens.expiresAt)) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens },
        });
      } else if (tokens?.refreshToken) {
        // Try to refresh the token
        await refreshToken();
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authApiService.login(credentials);
      
      // Store tokens and user data
      authStorage.setTokens(response.tokens);
      authStorage.setUser(response.user);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens: response.tokens,
        },
      });
      
      toast.success('Welcome back!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authApiService.register(credentials);
      
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.success(response.message || 'OTP sent successfully to your email!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authApiService.verifyOTP(email, otp);
      
      // Store tokens and user data
      authStorage.setTokens(response.tokens);
      authStorage.setUser(response.user);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens: response.tokens,
        },
      });
      
      toast.success('Account verified and logged in successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'OTP Verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      authStorage.clearAll();
      dispatch({ type: 'AUTH_LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const resetPassword = async (credentials: ResetPasswordCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authApiService.resetPassword(credentials);
      
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.success(response.message || 'Password reset email sent');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const changePassword = async (credentials: ChangePasswordCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authApiService.changePassword(credentials);
      
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.success(response.message || 'Password changed successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = authStorage.getRefreshToken();
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await authApiService.refreshToken(refreshTokenValue);
      
      const newTokens = {
        accessToken: response.accessToken,
        refreshToken: refreshTokenValue, // Keep the same refresh token
        expiresAt: response.expiresAt,
      };
      
      authStorage.setTokens(newTokens);
      
      // Get updated user profile
      const user = await authApiService.getProfile();
      authStorage.setUser(user);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          tokens: newTokens,
        },
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      authStorage.clearAll();
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    changePassword,
    verifyOTP,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
