import apiClient from "@/lib/api-client";
import type {
  BillingAddressDetailDto,
  DeliveryAddressDetailDto,
  CreateBillingAddressDto,
  CreateDeliveryAddressDto,
  UpdateBillingAddressDto,
  UpdateDeliveryAddressDto,
} from "@/types/addresses";

export const addressesApi = {
  async getBillingAddress(): Promise<BillingAddressDetailDto | null> {
    try {
      const response = await apiClient.get<BillingAddressDetailDto>("/addresses/billing");
      return response.data;
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } }).response?.status === 404) {
        return null; // No billing address found
      }
      throw error;
    }
  },

  async getDeliveryAddresses(): Promise<DeliveryAddressDetailDto[]> {
    try {
      const response = await apiClient.get<DeliveryAddressDetailDto[]>("/addresses/delivery");
      return response.data;
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } }).response?.status === 404) {
        return []; // No delivery addresses found
      }
      throw error;
    }
  },

  async createBillingAddress(dto: CreateBillingAddressDto): Promise<BillingAddressDetailDto> {
    const response = await apiClient.post<BillingAddressDetailDto>("/addresses/billing", dto);
    return response.data;
  },

  async createDeliveryAddress(dto: CreateDeliveryAddressDto): Promise<DeliveryAddressDetailDto> {
    const response = await apiClient.post<DeliveryAddressDetailDto>("/addresses/delivery", dto);
    return response.data;
  },

  async updateBillingAddress(dto: UpdateBillingAddressDto): Promise<BillingAddressDetailDto> {
    const response = await apiClient.put<BillingAddressDetailDto>("/addresses/billing", dto);
    return response.data;
  },

  async updateDeliveryAddress(id: string, dto: UpdateDeliveryAddressDto): Promise<DeliveryAddressDetailDto> {
    const response = await apiClient.put<DeliveryAddressDetailDto>(`/addresses/delivery/${id}`, dto);
    return response.data;
  },

  async deleteDeliveryAddress(id: string): Promise<void> {
    await apiClient.delete(`/addresses/delivery/${id}`);
  },
};

export default addressesApi;
