/**
 * Authentication API functions
 */

import axios, { AxiosResponse } from 'axios';
import {
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
  ChangePasswordCredentials,
  AuthResponse,
  AuthTokens,
  User,
  SocialProvider,
  SocialLoginResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Backend response shapes (snake_case from FastAPI/Pydantic)
interface BackendUser {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  subscription_tier: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface BackendTokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface BackendAuthResponse {
  user: BackendUser;
  tokens: BackendTokenPair;
}

function mapUser(u: BackendUser): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? '',
    avatar: u.avatar_url ?? undefined,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

function mapTokens(t: BackendTokenPair): AuthTokens {
  return {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: Date.now() + t.expires_in * 1000,
  };
}

// Create axios instance with default config
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post<BackendTokenPair>(
            `${API_BASE_URL}/api/auth/refresh`,
            { refresh_token: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const tokens = mapTokens(response.data);
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new CustomEvent('auth:session_expired'));
      }
    }

    return Promise.reject(error);
  }
);

export const authApiService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<BackendAuthResponse> = await authApi.post('/login', credentials);
    return {
      user: mapUser(response.data.user),
      tokens: mapTokens(response.data.tokens),
    };
  },

  // Register new user (returns message that OTP was sent)
  async register(credentials: RegisterCredentials): Promise<{ message: string }> {
    const { name, email, password } = credentials;
    const response = await authApi.post<{ message: string }>('/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Verify OTP for newly registered user
  async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    const response: AxiosResponse<BackendAuthResponse> = await authApi.post('/verify-otp', {
      email,
      otp,
    });
    return {
      user: mapUser(response.data.user),
      tokens: mapTokens(response.data.tokens),
    };
  },

  // Logout user
  async logout(): Promise<void> {
    await authApi.post('/logout');
  },

  // Forgot password: request OTP via email
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await authApi.post<{ message: string }>('/forgot-password', { email });
    return response.data;
  },

  // Verify OTP for password reset (does not change password)
  async verifyResetOTP(email: string, otp: string): Promise<{ message: string }> {
    const response = await authApi.post<{ message: string }>('/verify-reset-otp', {
      email,
      otp,
    });
    return response.data;
  },

  // Confirm password reset with OTP and new password
  async confirmResetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await authApi.post<{ message: string }>('/reset-password', {
      email,
      otp,
      new_password: newPassword,
    });
    return response.data;
  },

  // Legacy: reset password request (kept for backwards compat via context)
  async resetPassword(credentials: ResetPasswordCredentials): Promise<{ message: string }> {
    return this.forgotPassword(credentials.email);
  },

  // Change password (not yet implemented on backend)
  async changePassword(credentials: ChangePasswordCredentials): Promise<{ message: string }> {
    const response = await authApi.post('/change-password', credentials);
    return response.data;
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number }> {
    const response: AxiosResponse<BackendTokenPair> = await authApi.post('/refresh', {
      refresh_token: refreshToken,
    });
    const tokens = mapTokens(response.data);
    return { accessToken: tokens.accessToken, expiresAt: tokens.expiresAt };
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response: AxiosResponse<BackendUser> = await authApi.get('/profile');
    return mapUser(response.data);
  },

  // Update user profile (not yet implemented on backend)
  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<BackendUser> = await authApi.put('/profile', data);
    return mapUser(response.data);
  },

  // Social login (not yet implemented on backend)
  async socialLogin(provider: SocialProvider, code: string): Promise<SocialLoginResponse> {
    const response: AxiosResponse<SocialLoginResponse> = await authApi.post(`/social/${provider}`, {
      code,
    });
    return response.data;
  },

  // Verify email (not yet implemented on backend)
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await authApi.post('/verify-email', { token });
    return response.data;
  },

  // Resend verification email (not yet implemented on backend)
  async resendVerification(): Promise<{ message: string }> {
    const response = await authApi.post('/resend-verification');
    return response.data;
  },
};
