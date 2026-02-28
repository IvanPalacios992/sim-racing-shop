import { apiClient } from "@/lib/api-client";
import type { PaginatedResult } from "@/types/categories";
import type { AdminOrderSummaryDto, AdminOrderDetailDto, UpdateOrderStatusDto } from "@/types/admin";

export const adminOrdersApi = {
  async list(page = 1, pageSize = 20, status?: string): Promise<PaginatedResult<AdminOrderSummaryDto>> {
    const response = await apiClient.get<PaginatedResult<AdminOrderSummaryDto>>("/admin/orders", {
      params: { Page: page, PageSize: pageSize, ...(status ? { Status: status } : {}) },
    });
    return response.data;
  },

  async getById(id: string): Promise<AdminOrderDetailDto> {
    const response = await apiClient.get<AdminOrderDetailDto>(`/admin/orders/${id}`);
    return response.data;
  },

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<AdminOrderDetailDto> {
    const response = await apiClient.patch<AdminOrderDetailDto>(`/admin/orders/${id}/status`, dto);
    return response.data;
  },
};
