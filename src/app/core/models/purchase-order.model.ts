export type PurchaseOrderStatus = 'pending' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitCost: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName?: string;
  status: PurchaseOrderStatus;
  totalAmount: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  receivedAt: string | null;
}

export interface CreatePurchaseOrderItemInput {
  productId: string;
  quantity: number;
  unitCost: string;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  items: CreatePurchaseOrderItemInput[];
}
