import React from "react";
import { render, screen, fireEvent } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuthStore } from "@/stores/auth-store";
import { resetAuthStore, createMockAuthResponse } from "../../helpers/auth-store";
import { authApi } from "@/lib/api/auth";

// Stable push ref needed for router assertions (setup.ts creates new fns each call)
const mockPush = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  Link: (props: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    role?: string;
    [key: string]: unknown;
  }) => {
    const { href, children, ...rest } = props;
    return React.createElement("a", { href, ...rest }, children);
  },
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  authApi: {
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("UserMenu", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  describe("sin sesión iniciada", () => {
    it("renderiza un enlace a /login", () => {
      render(<UserMenu />);

      expect(screen.getByRole("link")).toHaveAttribute("href", "/login");
    });

    it("no muestra botón de toggle", () => {
      render(<UserMenu />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("no muestra menú desplegable", () => {
      render(<UserMenu />);

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("con sesión iniciada", () => {
    beforeEach(() => {
      useAuthStore.getState().setAuth(createMockAuthResponse());
    });

    it("muestra botón de toggle en lugar de enlace a login", () => {
      render(<UserMenu />);

      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("el desplegable está cerrado por defecto", () => {
      render(<UserMenu />);

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("abre el desplegable al hacer clic en el botón", async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("cierra el desplegable al hacer clic en el botón de nuevo", async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      const btn = screen.getByRole("button");
      await user.click(btn);
      await user.click(btn);

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("el botón tiene aria-expanded=false cuando el menú está cerrado", () => {
      render(<UserMenu />);

      expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    });

    it("el botón tiene aria-expanded=true cuando el menú está abierto", async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    });

    describe("contenido del desplegable", () => {
      it("muestra nombre completo y email del usuario", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));

        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
      });

      it("enlaza Mi Perfil a /perfil", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));

        expect(screen.getByRole("menuitem", { name: /my profile/i })).toHaveAttribute(
          "href",
          "/perfil",
        );
      });

      it("enlaza Mis Pedidos a /pedidos", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));

        expect(screen.getByRole("menuitem", { name: /my orders/i })).toHaveAttribute(
          "href",
          "/pedidos",
        );
      });

      it("enlaza Configuración a /configuracion", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));

        expect(screen.getByRole("menuitem", { name: /settings/i })).toHaveAttribute(
          "href",
          "/configuracion",
        );
      });

      it("muestra opción de cerrar sesión", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));

        expect(screen.getByRole("menuitem", { name: /sign out/i })).toBeInTheDocument();
      });
    });

    describe("cierre del desplegable", () => {
      it("cierra al presionar Escape", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));
        expect(screen.getByRole("menu")).toBeInTheDocument();

        fireEvent.keyDown(document, { key: "Escape" });

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });

      it("cierra al hacer clic fuera del menú", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));
        expect(screen.getByRole("menu")).toBeInTheDocument();

        fireEvent.mouseDown(document.body);

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });

      it("cierra al hacer clic en un enlace del menú", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));
        await user.click(screen.getByRole("menuitem", { name: /my profile/i }));

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    describe("cerrar sesión", () => {
      it("llama a authApi.logout", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));
        await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

        expect(authApi.logout).toHaveBeenCalledTimes(1);
      });

      it("limpia el estado de autenticación del store", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));
        await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

        expect(useAuthStore.getState().isAuthenticated).toBe(false);
      });

      it("redirige a la página de inicio", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));
        await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

        expect(mockPush).toHaveBeenCalledWith("/");
      });

      it("cierra el desplegable al iniciar el logout", async () => {
        const user = userEvent.setup();
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));
        await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });
  });

  describe("nombre de usuario mostrado", () => {
    it("muestra nombre y apellido cuando ambos están disponibles", async () => {
      const user = userEvent.setup();
      useAuthStore.getState().setAuth(
        createMockAuthResponse({
          user: {
            id: "1",
            email: "a@b.com",
            firstName: "John",
            lastName: "Doe",
            language: "en",
            emailVerified: true,
            roles: ["Customer"],
          },
        }),
      );
      render(<UserMenu />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("muestra solo el nombre si no hay apellido", async () => {
      const user = userEvent.setup();
      useAuthStore.getState().setAuth(
        createMockAuthResponse({
          user: {
            id: "1",
            email: "a@b.com",
            firstName: "John",
            language: "en",
            emailVerified: true,
            roles: ["Customer"],
          },
        }),
      );
      render(<UserMenu />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("John")).toBeInTheDocument();
    });

    it("usa el email como nombre si no hay nombre ni apellido", async () => {
      const user = userEvent.setup();
      useAuthStore.getState().setAuth(
        createMockAuthResponse({
          user: {
            id: "1",
            email: "noname@example.com",
            language: "en",
            emailVerified: true,
            roles: ["Customer"],
          },
        }),
      );
      render(<UserMenu />);

      await user.click(screen.getByRole("button"));

      // El email aparece dos veces: como display name y como fila de email
      expect(screen.getAllByText("noname@example.com")).toHaveLength(2);
    });
  });
});
