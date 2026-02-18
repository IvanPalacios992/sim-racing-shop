import apiClient from "@/lib/api-client";
import type { OrderSummaryDto, OrderDetailDto } from "@/types/orders";

export const ordersApi = {
  async getOrders(): Promise<OrderSummaryDto[]> {
    const response = await apiClient.get<OrderSummaryDto[]>("/orders");
    return response.data;
  },

  async getOrderById(id: string): Promise<OrderDetailDto> {
    const response = await apiClient.get<OrderDetailDto>(`/orders/${id}`);
    return response.data;
  },
};

export default ordersApi;
