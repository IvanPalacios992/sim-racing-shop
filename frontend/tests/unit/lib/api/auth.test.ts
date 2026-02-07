import { authApi } from "@/lib/api/auth";
import apiClient, { setStoredTokens, clearStoredTokens } from "@/lib/api-client";
import type { AuthResponseDto, UserDto } from "@/types/auth";

vi.mock("@/lib/api-client", () => {
  const mockApiClient = {
    post: vi.fn(),
    get: vi.fn(),
    defaults: { headers: { "Content-Type": "application/json" } },
  };
  return {
    default: mockApiClient,
    apiClient: mockApiClient,
    setStoredTokens: vi.fn(),
    clearStoredTokens: vi.fn(),
    getStoredToken: vi.fn(),
    getStoredRefreshToken: vi.fn(),
  };
});

const mockAuthResponse: AuthResponseDto = {
  token: "jwt-token",
  refreshToken: "refresh-token",
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
  user: {
    id: "user-1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    language: "en",
    emailVerified: true,
    roles: ["User"],
  },
};

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("posts to /auth/login and stores tokens", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAuthResponse });

      const result = await authApi.login({ email: "test@example.com", password: "Pass123!" });

      expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "Pass123!",
      });
      expect(setStoredTokens).toHaveBeenCalledWith("jwt-token", "refresh-token");
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe("register", () => {
    it("posts to /auth/register and stores tokens", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAuthResponse });

      const dto = {
        email: "new@example.com",
        password: "Pass123!",
        confirmPassword: "Pass123!",
        firstName: "New",
      };
      const result = await authApi.register(dto);

      expect(apiClient.post).toHaveBeenCalledWith("/auth/register", dto);
      expect(setStoredTokens).toHaveBeenCalledWith("jwt-token", "refresh-token");
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe("forgotPassword", () => {
    it("posts to /auth/forgot-password", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      await authApi.forgotPassword({ email: "test@example.com" });

      expect(apiClient.post).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "test@example.com",
      });
    });
  });

  describe("resetPassword", () => {
    it("posts to /auth/reset-password", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      const dto = {
        email: "test@example.com",
        token: "reset-token",
        newPassword: "NewPass123!",
        confirmPassword: "NewPass123!",
      };
      await authApi.resetPassword(dto);

      expect(apiClient.post).toHaveBeenCalledWith("/auth/reset-password", dto);
    });
  });

  describe("logout", () => {
    it("posts to /auth/logout and clears tokens", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      await authApi.logout();

      expect(apiClient.post).toHaveBeenCalledWith("/auth/logout");
      expect(clearStoredTokens).toHaveBeenCalled();
    });

    it("clears tokens even when API call fails", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error("Network error"));

      await expect(authApi.logout()).rejects.toThrow("Network error");
      expect(clearStoredTokens).toHaveBeenCalled();
    });
  });

  describe("getMe", () => {
    it("gets /auth/me and returns user", async () => {
      const user: UserDto = mockAuthResponse.user;
      vi.mocked(apiClient.get).mockResolvedValue({ data: user });

      const result = await authApi.getMe();

      expect(apiClient.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(user);
    });
  });

  describe("refreshToken", () => {
    it("posts to /auth/refresh and stores new tokens", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAuthResponse });

      const result = await authApi.refreshToken("old-refresh");

      expect(apiClient.post).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken: "old-refresh",
      });
      expect(setStoredTokens).toHaveBeenCalledWith("jwt-token", "refresh-token");
      expect(result).toEqual(mockAuthResponse);
    });
  });
});
