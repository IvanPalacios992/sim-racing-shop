import React from "react";
import { render, screen, act } from "../../helpers/render";
import { useAuthStore } from "@/stores/auth-store";
import { resetAuthStore, createMockAuthResponse } from "../../helpers/auth-store";
import AdminGuard from "@/components/admin/AdminGuard";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/admin/categorias",
}));

const adminAuth = () =>
  createMockAuthResponse({
    user: {
      id: "admin-1",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      language: "en",
      emailVerified: true,
      roles: ["Admin"],
    },
  });

const customerAuth = () => createMockAuthResponse(); // roles: ["Customer"] por defecto

describe("AdminGuard", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  describe("estado de carga", () => {
    it("muestra 'Verificando acceso...' cuando el store no está hidratado", () => {
      useAuthStore.setState({ _hasHydrated: false });

      render(
        <AdminGuard>
          <span data-testid="child">Contenido</span>
        </AdminGuard>,
      );

      expect(screen.getByText("Verificando acceso...")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });

    it("muestra 'Verificando acceso...' cuando no está autenticado", () => {
      // resetAuthStore() deja: _hasHydrated=true, isAuthenticated=false
      render(
        <AdminGuard>
          <span data-testid="child">Contenido</span>
        </AdminGuard>,
      );

      expect(screen.getByText("Verificando acceso...")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });

    it("muestra 'Verificando acceso...' cuando está autenticado pero no es Admin", () => {
      useAuthStore.getState().setAuth(customerAuth());

      render(
        <AdminGuard>
          <span data-testid="child">Contenido</span>
        </AdminGuard>,
      );

      expect(screen.getByText("Verificando acceso...")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });
  });

  describe("redirecciones", () => {
    it("no redirige cuando el store aún no está hidratado", () => {
      vi.useFakeTimers();
      useAuthStore.setState({ _hasHydrated: false });

      render(
        <AdminGuard>
          <span data-testid="child">Contenido</span>
        </AdminGuard>,
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockPush).not.toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("redirige a /login cuando no está autenticado (tras 300ms)", () => {
      vi.useFakeTimers();

      render(
        <AdminGuard>
          <span data-testid="child">Contenido</span>
        </AdminGuard>,
      );

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockPush).toHaveBeenCalledWith("/login");
      vi.useRealTimers();
    });

    it("no redirige antes de que pasen los 300ms", () => {
      vi.useFakeTimers();

      render(
        <AdminGuard>
          <span data-testid="child">Contenido</span>
        </AdminGuard>,
      );

      act(() => {
        vi.advanceTimersByTime(299);
      });

      expect(mockPush).not.toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("redirige a / cuando autenticado pero sin rol Admin (tras 300ms)", () => {
      vi.useFakeTimers();
      useAuthStore.getState().setAuth(customerAuth());

      render(
        <AdminGuard>
          <span data-testid="child">Contenido</span>
        </AdminGuard>,
      );

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockPush).toHaveBeenCalledWith("/");
      vi.useRealTimers();
    });

    it("no redirige cuando está autenticado como Admin", () => {
      vi.useFakeTimers();
      useAuthStore.getState().setAuth(adminAuth());

      render(
        <AdminGuard>
          <span data-testid="child">Contenido</span>
        </AdminGuard>,
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockPush).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe("acceso concedido", () => {
    it("renderiza los hijos cuando está autenticado como Admin", () => {
      useAuthStore.getState().setAuth(adminAuth());

      render(
        <AdminGuard>
          <span data-testid="child">Panel de administración</span>
        </AdminGuard>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.queryByText("Verificando acceso...")).not.toBeInTheDocument();
    });

    it("renderiza correctamente múltiples hijos como Admin", () => {
      useAuthStore.getState().setAuth(adminAuth());

      render(
        <AdminGuard>
          <h1 data-testid="title">Administración</h1>
          <p data-testid="subtitle">Gestión del sistema</p>
        </AdminGuard>,
      );

      expect(screen.getByTestId("title")).toBeInTheDocument();
      expect(screen.getByTestId("subtitle")).toBeInTheDocument();
    });
  });
});
