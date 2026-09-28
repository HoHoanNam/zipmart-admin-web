export interface Coupon {
  id: string;
  code: string;
  discountPercent: string;
  active: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  minOrderAmount: string | null;
  perUserLimit: number | null;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  discountPercent: number;
  active?: boolean;
  expiresAt?: string;
  usageLimit?: number;
  minOrderAmount?: number;
  perUserLimit?: number;
}

export interface UpdateCouponInput {
  discountPercent?: number;
  active?: boolean;
  expiresAt?: string | null;
  usageLimit?: number | null;
  minOrderAmount?: number | null;
  perUserLimit?: number | null;
}
