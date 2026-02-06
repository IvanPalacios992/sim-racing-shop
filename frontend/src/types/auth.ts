// Auth DTOs matching backend
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  language?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  language: string;
  emailVerified: boolean;
  roles: string[];
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

// Auth state for Zustand store
export interface AuthState {
  user: UserDto | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setAuth: (response: AuthResponseDto) => void;
  setUser: (user: UserDto) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;
