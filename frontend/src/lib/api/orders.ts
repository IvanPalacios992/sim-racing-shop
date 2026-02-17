import apiClient from "@/lib/api-client";
import type { OrderSummaryDto } from "@/types/orders";

export const ordersApi = {
  async getOrders(): Promise<OrderSummaryDto[]> {
    const response = await apiClient.get<OrderSummaryDto[]>("/orders");
    return response.data;
  },
};

export default ordersApi;
