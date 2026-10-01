export type ReturnReason = 'defective' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other';

/**
 * `requested` → `approved`/`rejected` decision. `resolve(action: 'approve')`
 * settles in the same call to `refunded` (gateway payment existed, refunded
 * automatically) or `completed` (COD order, refund handled manually offline)
 * — there's no separate "approved" resting state visible to the admin UI.
 */
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'refunded' | 'completed';

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  orderItemId: string;
  reason: ReturnReason;
  note: string | null;
  status: ReturnStatus;
  refundAmount: string | null;
  refundPaymentId: string | null;
  resolvedByUserId: string | null;
  createdAt: string;
}

export interface ResolveReturnRequestInput {
  action: 'approve' | 'reject';
  note?: string;
}
