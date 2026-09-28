export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  imageUrl?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  imageUrl?: string;
}
