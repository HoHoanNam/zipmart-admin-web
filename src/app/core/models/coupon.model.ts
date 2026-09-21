export interface Coupon {
  id: string;
  code: string;
  discountPercent: string;
  active: boolean;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  discountPercent: number;
  active?: boolean;
}

export interface UpdateCouponInput {
  discountPercent?: number;
  active?: boolean;
}
