import {
  getStoredToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  apiClient,
} from "@/lib/api-client";
import axios, { AxiosError, AxiosHeaders } from "axios";

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => {
        const instance = actual.default.create();
        // Spy on interceptors
        (instance as unknown as Record<string, unknown>)._requestInterceptors = instance.interceptors.request;
        (instance as unknown as Record<string, unknown>)._responseInterceptors = instance.interceptors.response;
        return instance;
      }),
      post: vi.fn(),
    },
  };
});

describe("api-client", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getStoredToken", () => {
    it("returns null when no token is stored", () => {
      expect(getStoredToken()).toBeNull();
    });

    it("returns the stored token", () => {
      localStorage.setItem("auth-token", "my-token");
      expect(getStoredToken()).toBe("my-token");
    });
  });

  describe("getStoredRefreshToken", () => {
    it("returns null when no refresh token is stored", () => {
      expect(getStoredRefreshToken()).toBeNull();
    });

    it("returns the stored refresh token", () => {
      localStorage.setItem("auth-refresh-token", "my-refresh");
      expect(getStoredRefreshToken()).toBe("my-refresh");
    });
  });

  describe("setStoredTokens", () => {
    it("stores both tokens in localStorage", () => {
      setStoredTokens("token-val", "refresh-val");
      expect(localStorage.getItem("auth-token")).toBe("token-val");
      expect(localStorage.getItem("auth-refresh-token")).toBe("refresh-val");
    });
  });

  describe("clearStoredTokens", () => {
    it("removes both tokens from localStorage", () => {
      localStorage.setItem("auth-token", "token-val");
      localStorage.setItem("auth-refresh-token", "refresh-val");
      clearStoredTokens();
      expect(localStorage.getItem("auth-token")).toBeNull();
      expect(localStorage.getItem("auth-refresh-token")).toBeNull();
    });
  });

  describe("apiClient instance", () => {
    it("is an axios instance", () => {
      expect(apiClient).toBeDefined();
      expect(typeof apiClient.get).toBe("function");
      expect(typeof apiClient.post).toBe("function");
    });
  });

  describe("request interceptor", () => {
    it("adds Authorization header when token exists", async () => {
      localStorage.setItem("auth-token", "test-bearer-token");

      // Access the request interceptor handlers
      const interceptors = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: unknown) => unknown }> }).handlers;
      const requestInterceptor = interceptors[0];

      const config = {
        headers: new AxiosHeaders(),
        url: "/some-endpoint",
      };

      const result = requestInterceptor.fulfilled(config) as { headers: AxiosHeaders };
      expect(result.headers.get("Authorization")).toBe("Bearer test-bearer-token");
    });

    it("does not add Authorization header when no token", async () => {
      const interceptors = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: unknown) => unknown }> }).handlers;
      const requestInterceptor = interceptors[0];

      const config = {
        headers: new AxiosHeaders(),
        url: "/some-endpoint",
      };

      const result = requestInterceptor.fulfilled(config) as { headers: AxiosHeaders };
      expect(result.headers.get("Authorization")).toBeFalsy();
    });
  });

  describe("response interceptor", () => {
    let responseInterceptor: {
      fulfilled: (response: unknown) => unknown;
      rejected: (error: unknown) => Promise<unknown>;
    };

    beforeEach(() => {
      const interceptors = (apiClient.interceptors.response as unknown as { handlers: Array<{ fulfilled: (response: unknown) => unknown; rejected: (error: unknown) => Promise<unknown> }> }).handlers;
      responseInterceptor = interceptors[0];
    });

    it("passes through successful responses", () => {
      const response = { status: 200, data: { ok: true } };
      expect(responseInterceptor.fulfilled(response)).toBe(response);
    });

    it("rejects non-401 errors", async () => {
      const error = new AxiosError("Not Found", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 404,
        data: {},
        statusText: "Not Found",
        headers: {},
        config: { headers: new AxiosHeaders() },
      });
      error.config = { headers: new AxiosHeaders(), url: "/some-endpoint" } as never;

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
    });

    it("rejects 401 errors on auth endpoints without refresh attempt", async () => {
      const error = new AxiosError("Unauthorized", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
      });
      error.config = { headers: new AxiosHeaders(), url: "/auth/login" } as never;

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
    });

    it("rejects 401 errors on register endpoint without refresh attempt", async () => {
      const error = new AxiosError("Unauthorized", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
      });
      error.config = { headers: new AxiosHeaders(), url: "/auth/register" } as never;

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
    });

    it("rejects 401 errors on refresh endpoint without refresh attempt", async () => {
      const error = new AxiosError("Unauthorized", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
      });
      error.config = { headers: new AxiosHeaders(), url: "/auth/refresh" } as never;

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
    });

    it("clears tokens and rejects when no refresh token available", async () => {
      localStorage.setItem("auth-token", "old-token");

      const error = new AxiosError("Unauthorized", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
      });
      error.config = { headers: new AxiosHeaders(), url: "/api/data" } as never;

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
      expect(localStorage.getItem("auth-token")).toBeNull();
      expect(localStorage.getItem("auth-refresh-token")).toBeNull();
    });

    it("attempts token refresh on 401 with refresh token available", async () => {
      localStorage.setItem("auth-token", "old-token");
      localStorage.setItem("auth-refresh-token", "old-refresh");

      const newAuthResponse = {
        token: "new-token",
        refreshToken: "new-refresh",
        expiresAt: new Date().toISOString(),
        user: { id: "1", email: "test@test.com" },
      };

      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: newAuthResponse });

      const error = new AxiosError("Unauthorized", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
      });
      error.config = { headers: new AxiosHeaders(), url: "/api/data" } as never;

      // The interceptor will try to refresh and then retry the original request
      // Since apiClient is a real axios instance, the retry will fail, but we can verify
      // the refresh was attempted
      try {
        await responseInterceptor.rejected(error);
      } catch {
        // Expected: the retry of the original request may fail
      }

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/refresh"),
        { refreshToken: "old-refresh" }
      );
      expect(localStorage.getItem("auth-token")).toBe("new-token");
      expect(localStorage.getItem("auth-refresh-token")).toBe("new-refresh");
    });

    it("clears tokens when refresh fails", async () => {
      localStorage.setItem("auth-token", "old-token");
      localStorage.setItem("auth-refresh-token", "old-refresh");

      (axios.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Refresh failed"));

      const error = new AxiosError("Unauthorized", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
      });
      error.config = { headers: new AxiosHeaders(), url: "/api/data" } as never;

      await expect(responseInterceptor.rejected(error)).rejects.toThrow("Refresh failed");
      expect(localStorage.getItem("auth-token")).toBeNull();
      expect(localStorage.getItem("auth-refresh-token")).toBeNull();
    });

    it("does not retry already-retried requests", async () => {
      const error = new AxiosError("Unauthorized", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
      });
      error.config = { headers: new AxiosHeaders(), url: "/api/data", _retry: true } as never;

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
    });
  });
});
