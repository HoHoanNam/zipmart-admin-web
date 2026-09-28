export interface Review {
  id: string;
  userId: string;
  productId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number;
  comment: string;
  hidden: boolean;
  adminReply: string | null;
  adminReplyAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModerateReviewInput {
  hidden?: boolean;
  adminReply?: string;
}
