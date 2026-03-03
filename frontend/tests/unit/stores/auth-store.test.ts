import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { resetAuthStore, createMockAuthResponse } from "../../helpers/auth-store";
import { createMockCart, resetCartStore } from "../../helpers/cart";

describe("auth-store", () => {
  beforeEach(() => {
    resetAuthStore();
    resetCartStore();
    localStorage.clear();
  });

  describe("initial state", () => {
    it("starts with user null, token null, isAuthenticated false, isLoading false", () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("setAuth", () => {
    it("sets user, token, refreshToken, isAuthenticated=true", () => {
      const mockResponse = createMockAuthResponse();
      useAuthStore.getState().setAuth(mockResponse);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe("mock-jwt-token");
      expect(state.refreshToken).toBe("mock-refresh-token");
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("setUser", () => {
    it("updates only the user field", () => {
      const mockResponse = createMockAuthResponse();
      useAuthStore.getState().setAuth(mockResponse);

      const newUser = { ...mockResponse.user, firstName: "Updated" };
      useAuthStore.getState().setUser(newUser);

      const state = useAuthStore.getState();
      expect(state.user?.firstName).toBe("Updated");
      expect(state.token).toBe("mock-jwt-token");
    });
  });

  describe("setLoading", () => {
    it("sets isLoading to the given value", () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe("logout", () => {
    it("resets all fields to initial state", () => {
      const mockResponse = createMockAuthResponse();
      useAuthStore.getState().setAuth(mockResponse);
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("vacía el carrito al cerrar sesión", () => {
      useCartStore.setState({ cart: createMockCart() });

      useAuthStore.getState().setAuth(createMockAuthResponse());
      useAuthStore.getState().logout();

      expect(useCartStore.getState().cart).toBeNull();
    });
  });

  describe("reset", () => {
    it("resets all fields to initial state", () => {
      const mockResponse = createMockAuthResponse();
      useAuthStore.getState().setAuth(mockResponse);
      useAuthStore.getState().reset();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
