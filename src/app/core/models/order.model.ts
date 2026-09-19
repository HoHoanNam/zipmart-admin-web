export type OrderStatus = 'pending' | 'paid' | 'shipped';

export interface AdminOrder {
  id: string;
  userId: string;
  userEmail: string | null;
  status: OrderStatus;
  total: string;
  createdAt: string;
}
