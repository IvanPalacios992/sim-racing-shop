import apiClient, { setStoredTokens, clearStoredTokens } from "@/lib/api-client";
import type {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
  UserDto,
} from "@/types/auth";

export const authApi = {
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>("/auth/login", dto);
    const data = response.data;
    setStoredTokens(data.token, data.refreshToken);
    return data;
  },

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>("/auth/register", dto);
    const data = response.data;
    setStoredTokens(data.token, data.refreshToken);
    return data;
  },

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    await apiClient.post("/auth/forgot-password", dto);
  },

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    await apiClient.post("/auth/reset-password", dto);
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      clearStoredTokens();
    }
  },

  async getMe(): Promise<UserDto> {
    const response = await apiClient.get<UserDto>("/auth/me");
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>("/auth/refresh", {
      refreshToken,
    });
    const data = response.data;
    setStoredTokens(data.token, data.refreshToken);
    return data;
  },
};

export default authApi;
