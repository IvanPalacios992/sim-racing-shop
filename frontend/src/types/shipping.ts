export interface CalculateShippingRequestDto {
  postalCode: string;
  subtotal: number;
  weightKg: number;
}

export interface ShippingCalculationDto {
  zoneName: string;
  baseCost: number;
  weightCost: number;
  totalCost: number;
  weightKg: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  subtotalNeededForFreeShipping: number;
}

export interface ShippingZoneDto {
  name: string;
  baseCost: number;
  costPerKg: number;
  freeShippingThreshold: number | null;
}
