// Address DTOs matching backend

export interface BillingAddressDetailDto {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface DeliveryAddressDetailDto {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface CreateBillingAddressDto {
  userId: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface UpdateBillingAddressDto {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface CreateDeliveryAddressDto {
  userId: string;
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface UpdateDeliveryAddressDto {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}
