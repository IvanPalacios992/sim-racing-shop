import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthStore, AuthResponseDto, UserDto } from "@/types/auth";
import { setStoredTokens, clearStoredTokens } from "@/lib/api-client";

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (response: AuthResponseDto) => {
        // Sync tokens with apiClient localStorage
        setStoredTokens(response.token, response.refreshToken);

        set({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setUser: (user: UserDto) => {
        set({ user });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      logout: () => {
        // Clear tokens from apiClient localStorage
        clearStoredTokens();

        set({
          ...initialState,
        });
      },

      reset: () => {
        // Clear tokens from apiClient localStorage
        clearStoredTokens();

        set(initialState);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Sync tokens with apiClient on store initialization
if (typeof window !== "undefined") {
  const state = useAuthStore.getState();
  if (state.token && state.refreshToken) {
    setStoredTokens(state.token, state.refreshToken);
  }
}

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
