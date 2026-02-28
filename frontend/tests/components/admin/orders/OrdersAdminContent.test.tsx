import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/stores/auth-store";
import { resetAuthStore, createMockAuthResponse } from "../../../helpers/auth-store";
import type { AdminOrderSummaryDto } from "@/types/admin";

vi.mock("@/lib/api/admin-orders", () => ({
  adminOrdersApi: {
    list: vi.fn(),
    getById: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock("@/components/admin/orders/OrderAdminDetailModal", () => ({
  default: ({ orderId }: { orderId: string | null }) =>
    orderId
      ? React.createElement("div", { "data-testid": "order-detail-modal" }, `Modal:${orderId}`)
      : null,
}));

import OrdersAdminContent from "@/components/admin/orders/OrdersAdminContent";
import { adminOrdersApi } from "@/lib/api/admin-orders";

const mockOrders: AdminOrderSummaryDto[] = [
  {
    id: "order-1",
    orderNumber: "ORD-20260201-0001",
    userEmail: "usuario@example.com",
    totalAmount: 369.23,
    orderStatus: "pending",
    createdAt: "2026-02-01T10:00:00Z",
    itemCount: 2,
  },
  {
    id: "order-2",
    orderNumber: "ORD-20260202-0001",
    userEmail: null,
    totalAmount: 199.0,
    orderStatus: "delivered",
    createdAt: "2026-02-02T12:00:00Z",
    itemCount: 1,
  },
];

const emptyPaginated = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
const paginated = (items: AdminOrderSummaryDto[], totalPages = 1) => ({
  items,
  totalCount: items.length,
  page: 1,
  pageSize: 20,
  totalPages,
});

describe("OrdersAdminContent", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
    useAuthStore.getState().setAuth(createMockAuthResponse());
    useAuthStore.setState({ _hasHydrated: true });
  });

  // ── loading ────────────────────────────────────────────────────────────────

  describe("loading", () => {
    it("muestra skeleton mientras carga", () => {
      vi.mocked(adminOrdersApi.list).mockImplementation(() => new Promise(() => {}));

      render(<OrdersAdminContent />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("no llama a la API hasta que el store está hidratado", () => {
      useAuthStore.setState({ _hasHydrated: false });

      render(<OrdersAdminContent />);

      expect(adminOrdersApi.list).not.toHaveBeenCalled();
    });

    it("llama a list con los parámetros por defecto", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(emptyPaginated);

      render(<OrdersAdminContent />);

      await waitFor(() => {
        expect(adminOrdersApi.list).toHaveBeenCalledWith(1, 20, undefined);
      });
    });
  });

  // ── error ──────────────────────────────────────────────────────────────────

  describe("error", () => {
    it("muestra mensaje de error cuando la API falla", async () => {
      vi.mocked(adminOrdersApi.list).mockRejectedValue(new Error("Network error"));

      render(<OrdersAdminContent />);

      await waitFor(() => {
        expect(screen.getByText("Error al cargar los pedidos")).toBeInTheDocument();
      });
    });

    it("muestra botón Reintentar al fallar", async () => {
      vi.mocked(adminOrdersApi.list).mockRejectedValue(new Error("Network error"));

      render(<OrdersAdminContent />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
      });
    });

    it("vuelve a cargar al hacer clic en Reintentar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOrdersApi.list)
        .mockRejectedValueOnce(new Error("error"))
        .mockResolvedValueOnce(emptyPaginated);

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument());
      await user.click(screen.getByRole("button", { name: "Reintentar" }));

      await waitFor(() => {
        expect(adminOrdersApi.list).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ── empty state ────────────────────────────────────────────────────────────

  describe("empty state", () => {
    it("muestra mensaje cuando no hay pedidos", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(emptyPaginated);

      render(<OrdersAdminContent />);

      await waitFor(() => {
        expect(screen.getByText("No hay pedidos con este estado")).toBeInTheDocument();
      });
    });

    it("no muestra enlace 'Ver todos' cuando el filtro activo es 'Todos'", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(emptyPaginated);

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByText("No hay pedidos con este estado")).toBeInTheDocument());

      expect(screen.queryByText("Ver todos los pedidos")).not.toBeInTheDocument();
    });
  });

  // ── tabla ──────────────────────────────────────────────────────────────────

  describe("tabla", () => {
    it("renderiza el título de la página", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => {
        expect(screen.getByText("Pedidos")).toBeInTheDocument();
      });
    });

    it("renderiza las cabeceras de columna", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => {
        expect(screen.getByText("N° Pedido")).toBeInTheDocument();
        expect(screen.getByText("Usuario")).toBeInTheDocument();
        expect(screen.getByText("Fecha")).toBeInTheDocument();
        expect(screen.getByText("Estado")).toBeInTheDocument();
        expect(screen.getByText("Total")).toBeInTheDocument();
        expect(screen.getByText("Artículos")).toBeInTheDocument();
        expect(screen.getByText("Acciones")).toBeInTheDocument();
      });
    });

    it("renderiza los números de pedido", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => {
        expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument();
        expect(screen.getByText("ORD-20260202-0001")).toBeInTheDocument();
      });
    });

    it("renderiza el email del usuario cuando existe", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => {
        expect(screen.getByText("usuario@example.com")).toBeInTheDocument();
      });
    });

    it("muestra '—' cuando el email del usuario es null", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => {
        expect(screen.getByText("—")).toBeInTheDocument();
      });
    });

    it("muestra botones 'Ver detalle' para cada pedido", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button", { name: "Ver detalle" });
        expect(buttons).toHaveLength(2);
      });
    });
  });

  // ── modal ──────────────────────────────────────────────────────────────────

  describe("modal de detalle", () => {
    it("abre el modal al hacer clic en 'Ver detalle'", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getAllByRole("button", { name: "Ver detalle" })).toHaveLength(2));

      await user.click(screen.getAllByRole("button", { name: "Ver detalle" })[0]);

      expect(screen.getByTestId("order-detail-modal")).toBeInTheDocument();
      expect(screen.getByText("Modal:order-1")).toBeInTheDocument();
    });

    it("no muestra el modal antes de hacer clic", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument());

      expect(screen.queryByTestId("order-detail-modal")).not.toBeInTheDocument();
    });
  });

  // ── paginación ─────────────────────────────────────────────────────────────

  describe("paginación", () => {
    it("no muestra paginación cuando hay una sola página", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders, 1));

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument());

      expect(screen.queryByText(/Página/)).not.toBeInTheDocument();
    });

    it("muestra paginación cuando hay múltiples páginas", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders, 3));

      render(<OrdersAdminContent />);

      await waitFor(() => {
        expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
      });
    });

    it("al hacer clic en Siguiente carga la página 2", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOrdersApi.list)
        .mockResolvedValueOnce(paginated(mockOrders, 2))
        .mockResolvedValueOnce({ items: [], totalCount: 0, page: 2, pageSize: 20, totalPages: 2 });

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByRole("button", { name: /Siguiente/ })).toBeInTheDocument());
      await user.click(screen.getByRole("button", { name: /Siguiente/ }));

      await waitFor(() => {
        expect(adminOrdersApi.list).toHaveBeenCalledWith(2, 20, undefined);
      });
    });
  });

  // ── filtros ────────────────────────────────────────────────────────────────

  describe("filtros de estado", () => {
    it("renderiza todos los chips de filtro", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument());

      expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Pendiente" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "En proceso" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Enviado" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Entregado" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancelado" })).toBeInTheDocument();
    });

    it("el chip 'Todos' tiene la clase activa por defecto", async () => {
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument());

      expect(screen.getByRole("button", { name: "Todos" }).className).toContain("bg-racing-red");
    });

    it("al hacer clic en 'Pendiente' llama a la API con Status=pending", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument());

      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated([mockOrders[0]]));
      await user.click(screen.getByRole("button", { name: "Pendiente" }));

      await waitFor(() => {
        expect(adminOrdersApi.list).toHaveBeenCalledWith(1, 20, "pending");
      });
    });

    it("al hacer clic en 'Entregado' llama a la API con Status=delivered", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument());

      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated([mockOrders[1]]));
      await user.click(screen.getByRole("button", { name: "Entregado" }));

      await waitFor(() => {
        expect(adminOrdersApi.list).toHaveBeenCalledWith(1, 20, "delivered");
      });
    });

    it("cambiar filtro resetea la paginación a página 1", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOrdersApi.list)
        .mockResolvedValueOnce(paginated(mockOrders, 3))
        .mockResolvedValue(paginated(mockOrders, 3));

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByRole("button", { name: /Siguiente/ })).toBeInTheDocument());
      await user.click(screen.getByRole("button", { name: /Siguiente/ }));
      await waitFor(() => expect(adminOrdersApi.list).toHaveBeenCalledWith(2, 20, undefined));

      vi.mocked(adminOrdersApi.list).mockResolvedValue(paginated([mockOrders[0]]));
      await user.click(screen.getByRole("button", { name: "Pendiente" }));

      await waitFor(() => {
        expect(adminOrdersApi.list).toHaveBeenCalledWith(1, 20, "pending");
      });
    });

    it("filtro sin resultados muestra mensaje y enlace para ver todos", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOrdersApi.list)
        .mockResolvedValueOnce(paginated(mockOrders))
        .mockResolvedValueOnce(emptyPaginated);

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "Cancelado" }));

      await waitFor(() => {
        expect(screen.getByText("No hay pedidos con este estado")).toBeInTheDocument();
        expect(screen.getByText("Ver todos los pedidos")).toBeInTheDocument();
      });
    });

    it("enlace 'Ver todos los pedidos' vuelve al filtro 'Todos'", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOrdersApi.list)
        .mockResolvedValueOnce(paginated(mockOrders))
        .mockResolvedValueOnce(emptyPaginated)
        .mockResolvedValueOnce(paginated(mockOrders));

      render(<OrdersAdminContent />);

      await waitFor(() => expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "Cancelado" }));
      await waitFor(() => expect(screen.getByText("Ver todos los pedidos")).toBeInTheDocument());

      await user.click(screen.getByText("Ver todos los pedidos"));

      await waitFor(() => {
        expect(adminOrdersApi.list).toHaveBeenCalledWith(1, 20, undefined);
      });
    });
  });
});
