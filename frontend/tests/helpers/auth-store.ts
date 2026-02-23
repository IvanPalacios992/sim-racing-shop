import { useAuthStore } from "@/stores/auth-store";
import type { AuthResponseDto } from "@/types/auth";

export function resetAuthStore() {
  useAuthStore.getState().reset();
}

export function createMockAuthResponse(
  overrides?: Partial<AuthResponseDto>
): AuthResponseDto {
  return {
    token: "mock-jwt-token",
    refreshToken: "mock-refresh-token",
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    user: {
      id: "user-123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      language: "en",
      emailVerified: true,
      roles: ["Customer"],
    },
    ...overrides,
  };
}
