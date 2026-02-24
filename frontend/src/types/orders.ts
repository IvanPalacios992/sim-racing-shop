export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItemSummaryDto {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: string;
  items: OrderItemSummaryDto[];
}

export interface OrderItemDetailDto {
  id: string;
  productId: string | null;
  productName: string;
  productSku: string;
  configurationJson: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetailDto {
  id: string;
  orderNumber: string;
  userId: string | null;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string;
  shippingCountry: string;
  paymentId: string | null;
  subtotal: number;
  vatAmount: number;
  shippingCost: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  estimatedProductionDays: number | null;
  productionNotes: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItemDetailDto[];
}

export interface CreateOrderItemDto {
  productId: string;
  productName: string;
  productSku: string;
  configurationJson?: string | null;
  quantity: number;
  /** Precio unitario con IVA */
  unitPrice: number;
  /** Precio unitario sin IVA */
  unitSubtotal: number;
  /** Total de línea con IVA */
  lineTotal: number;
  /** Total de línea sin IVA */
  lineSubtotal: number;
}

export interface CreateOrderDto {
  shippingStreet: string;
  shippingCity: string;
  shippingState?: string | null;
  shippingPostalCode: string;
  shippingCountry: string;
  subtotal: number;
  vatAmount: number;
  shippingCost: number;
  totalAmount: number;
  notes?: string | null;
  orderItems: CreateOrderItemDto[];
}
