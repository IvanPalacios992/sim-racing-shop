import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { AdminOrderDetailDto } from "@/types/admin";

vi.mock("@/lib/api/admin-orders", () => ({
  adminOrdersApi: {
    list: vi.fn(),
    getById: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock("@/components/admin/AdminModal", () => ({
  default: ({
    isOpen,
    title,
    children,
    onClose,
  }: {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
  }) =>
    isOpen
      ? React.createElement(
          "div",
          { "data-testid": "admin-modal" },
          React.createElement("h2", null, title),
          React.createElement("button", { onClick: onClose, "data-testid": "modal-close" }, "X"),
          children,
        )
      : null,
}));

import OrderAdminDetailModal from "@/components/admin/orders/OrderAdminDetailModal";
import { adminOrdersApi } from "@/lib/api/admin-orders";

const mockOrder: AdminOrderDetailDto = {
  id: "order-1",
  orderNumber: "ORD-20260201-0001",
  userId: "user-1",
  userEmail: "cliente@example.com",
  shippingStreet: "Calle Mayor 10",
  shippingCity: "Madrid",
  shippingState: null,
  shippingPostalCode: "28001",
  shippingCountry: "ES",
  paymentId: null,
  subtotal: 299.99,
  vatAmount: 62.99,
  shippingCost: 6.25,
  totalAmount: 369.23,
  orderStatus: "pending",
  estimatedProductionDays: null,
  productionNotes: null,
  trackingNumber: null,
  shippedAt: null,
  notes: null,
  createdAt: "2026-02-01T10:00:00Z",
  updatedAt: "2026-02-01T10:00:00Z",
  orderItems: [
    {
      id: "item-1",
      productId: "prod-1",
      productName: "Volante GT Pro",
      productSku: "VOL-GT-001",
      configurationJson: null,
      quantity: 1,
      unitPrice: 299.99,
      lineTotal: 299.99,
    },
  ],
};

const mockOrderWithConfig: AdminOrderDetailDto = {
  ...mockOrder,
  orderItems: [
    {
      ...mockOrder.orderItems[0],
      configurationJson: JSON.stringify({ Color: "Rojo", "Tipo de cuero": "Alcántara" }),
    },
  ],
};

const defaultProps = {
  onClose: vi.fn(),
  onOrderUpdated: vi.fn(),
};

describe("OrderAdminDetailModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── visibilidad ────────────────────────────────────────────────────────────

  describe("visibilidad", () => {
    it("no renderiza nada cuando orderId es null", () => {
      const { container } = render(
        <OrderAdminDetailModal {...defaultProps} orderId={null} />,
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("no llama a getById cuando orderId es null", () => {
      render(<OrderAdminDetailModal {...defaultProps} orderId={null} />);

      expect(adminOrdersApi.getById).not.toHaveBeenCalled();
    });

    it("renderiza el modal cuando orderId no es null", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      expect(screen.getByTestId("admin-modal")).toBeInTheDocument();
    });
  });

  // ── loading ────────────────────────────────────────────────────────────────

  describe("loading", () => {
    it("muestra skeleton mientras carga", () => {
      vi.mocked(adminOrdersApi.getById).mockImplementation(() => new Promise(() => {}));

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("llama a getById con el id correcto", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(adminOrdersApi.getById).toHaveBeenCalledWith("order-1");
      });
    });
  });

  // ── error ──────────────────────────────────────────────────────────────────

  describe("error", () => {
    it("muestra mensaje de error cuando la API falla", async () => {
      vi.mocked(adminOrdersApi.getById).mockRejectedValue(new Error("Error"));

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Error al cargar el pedido")).toBeInTheDocument();
      });
    });
  });

  // ── detalle del pedido ─────────────────────────────────────────────────────

  describe("detalle del pedido", () => {
    it("muestra el número de pedido en el título del modal", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Pedido ORD-20260201-0001")).toBeInTheDocument();
      });
    });

    it("muestra el número de pedido en el cuerpo", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument();
      });
    });

    it("muestra el email del usuario", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("cliente@example.com")).toBeInTheDocument();
      });
    });

    it("muestra '—' cuando el email del usuario es null", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue({ ...mockOrder, userEmail: null });

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("—")).toBeInTheDocument();
      });
    });

    it("muestra el nombre del producto en los artículos", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Volante GT Pro")).toBeInTheDocument();
      });
    });

    it("muestra el SKU del producto", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("VOL-GT-001")).toBeInTheDocument();
      });
    });

    it("muestra la dirección de envío", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Calle Mayor 10")).toBeInTheDocument();
        expect(screen.getByText(/28001/)).toBeInTheDocument();
        expect(screen.getByText(/Madrid/)).toBeInTheDocument();
      });
    });

    it("muestra las opciones de configuración parseadas cuando configurationJson no es null", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrderWithConfig);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Color: Rojo/)).toBeInTheDocument();
        expect(screen.getByText(/Tipo de cuero: Alcántara/)).toBeInTheDocument();
      });
    });

    it("no muestra línea de configuración cuando configurationJson es null", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => expect(screen.getByText("Volante GT Pro")).toBeInTheDocument());

      expect(screen.queryByText(/Color:/)).not.toBeInTheDocument();
    });
  });

  // ── avance de estado ───────────────────────────────────────────────────────

  describe("avance de estado", () => {
    it("muestra el botón 'Marcar como En proceso' cuando el estado es pending", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Marcar como En proceso" })).toBeInTheDocument();
      });
    });

    it("muestra el botón 'Marcar como Enviado' cuando el estado es processing", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue({
        ...mockOrder,
        orderStatus: "processing",
      });

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Marcar como Enviado" })).toBeInTheDocument();
      });
    });

    it("muestra el botón 'Marcar como Entregado' cuando el estado es shipped", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue({
        ...mockOrder,
        orderStatus: "shipped",
      });

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Marcar como Entregado" }),
        ).toBeInTheDocument();
      });
    });

    it("no muestra botón de avance cuando el estado es delivered", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue({
        ...mockOrder,
        orderStatus: "delivered",
      });

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument());

      expect(screen.queryByRole("button", { name: /Marcar como/ })).not.toBeInTheDocument();
    });

    it("no muestra botón de avance cuando el estado es cancelled", async () => {
      vi.mocked(adminOrdersApi.getById).mockResolvedValue({
        ...mockOrder,
        orderStatus: "cancelled",
      });

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() => expect(screen.getByText("ORD-20260201-0001")).toBeInTheDocument());

      expect(screen.queryByRole("button", { name: /Marcar como/ })).not.toBeInTheDocument();
    });

    it("llama a updateStatus con el siguiente estado al hacer clic", async () => {
      const user = userEvent.setup();
      const updatedOrder = { ...mockOrder, orderStatus: "processing" };
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);
      vi.mocked(adminOrdersApi.updateStatus).mockResolvedValue(updatedOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Marcar como En proceso" })).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: "Marcar como En proceso" }));

      await waitFor(() => {
        expect(adminOrdersApi.updateStatus).toHaveBeenCalledWith("order-1", {
          status: "processing",
        });
      });
    });

    it("actualiza el botón al siguiente estado tras avanzar correctamente", async () => {
      const user = userEvent.setup();
      const updatedOrder = { ...mockOrder, orderStatus: "processing" };
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);
      vi.mocked(adminOrdersApi.updateStatus).mockResolvedValue(updatedOrder);

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Marcar como En proceso" })).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: "Marcar como En proceso" }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Marcar como Enviado" })).toBeInTheDocument();
      });
    });

    it("llama a onOrderUpdated con los datos actualizados", async () => {
      const user = userEvent.setup();
      const onOrderUpdated = vi.fn();
      const updatedOrder = { ...mockOrder, orderStatus: "processing" };
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);
      vi.mocked(adminOrdersApi.updateStatus).mockResolvedValue(updatedOrder);

      render(
        <OrderAdminDetailModal
          orderId="order-1"
          onClose={vi.fn()}
          onOrderUpdated={onOrderUpdated}
        />,
      );

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Marcar como En proceso" })).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: "Marcar como En proceso" }));

      await waitFor(() => {
        expect(onOrderUpdated).toHaveBeenCalledWith(
          expect.objectContaining({ id: "order-1", orderStatus: "processing" }),
        );
      });
    });

    it("muestra error si updateStatus falla", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);
      vi.mocked(adminOrdersApi.updateStatus).mockRejectedValue(new Error("Error"));

      render(<OrderAdminDetailModal {...defaultProps} orderId="order-1" />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Marcar como En proceso" })).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: "Marcar como En proceso" }));

      await waitFor(() => {
        expect(screen.getByText("Error al actualizar el estado")).toBeInTheDocument();
      });
    });
  });

  // ── cierre del modal ───────────────────────────────────────────────────────

  describe("cierre del modal", () => {
    it("llama a onClose al hacer clic en el botón de cerrar", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      vi.mocked(adminOrdersApi.getById).mockResolvedValue(mockOrder);

      render(
        <OrderAdminDetailModal orderId="order-1" onClose={onClose} onOrderUpdated={vi.fn()} />,
      );

      await waitFor(() => expect(screen.getByTestId("modal-close")).toBeInTheDocument());

      await user.click(screen.getByTestId("modal-close"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
