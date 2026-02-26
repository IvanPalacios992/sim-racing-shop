export interface SelectedOption {
  groupName: string;
  componentId: string;
  componentName: string;
}

export interface CartItemDto {
  productId: string;
  sku: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  subtotal: number;
  selectedOptions?: SelectedOption[];
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
  /** Opciones seleccionadas con nombres, para persistirlas en el backend */
  selectedOptions?: SelectedOption[];
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface MergeCartDto {
  sessionId: string;
}
