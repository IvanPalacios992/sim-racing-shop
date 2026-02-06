import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthStore, AuthResponseDto, UserDto } from "@/types/auth";

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
        set({
          ...initialState,
        });
      },

      reset: () => {
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

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
