/**
 * Authentication types and interfaces
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface VerifyResetOTPCredentials {
  email: string;
  otp: string;
}

export interface ConfirmResetPasswordCredentials {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>;
  changePassword: (credentials: ChangePasswordCredentials) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Social login providers
export type SocialProvider = 'google' | 'github';

export interface SocialLoginResponse {
  user: User;
  tokens: AuthTokens;
  isNewUser: boolean;
}
