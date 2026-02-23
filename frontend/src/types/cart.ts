export interface CartItemDto {
  productId: string;
  sku: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  subtotal: number;
}

export interface CartDto {
  items: CartItemDto[];
  totalItems: number;
  subtotal: number;
  vatAmount: number;
  total: number;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
  /** IDs de los componentes seleccionados en el configurador 3D */
  selectedComponentIds?: string[];
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface MergeCartDto {
  sessionId: string;
}
