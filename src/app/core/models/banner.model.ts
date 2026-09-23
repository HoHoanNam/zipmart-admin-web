export interface Banner {
  id: string;
  imageUrl: string;
  headline: string;
  subtext: string | null;
  ctaLabel: string | null;
  ctaLink: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export interface CreateBannerInput {
  imageUrl: string;
  headline: string;
  subtext?: string;
  ctaLabel?: string;
  ctaLink?: string;
  sortOrder?: number;
  active?: boolean;
}

export type UpdateBannerInput = Partial<CreateBannerInput>;
