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
