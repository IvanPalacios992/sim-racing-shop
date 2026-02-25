import { apiClient } from "@/lib/api-client";
import type { CalculateShippingRequestDto, ShippingCalculationDto, ShippingZoneDto } from "@/types/shipping";

export const shippingApi = {
  async calculate(dto: CalculateShippingRequestDto): Promise<ShippingCalculationDto> {
    const response = await apiClient.post<ShippingCalculationDto>("/shipping/calculate", dto);
    return response.data;
  },

  async getZones(): Promise<ShippingZoneDto[]> {
    const response = await apiClient.get<ShippingZoneDto[]>("/shipping/zones");
    return response.data;
  },
};
