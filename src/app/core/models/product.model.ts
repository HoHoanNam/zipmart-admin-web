export interface Product {
  id: string;
  name: string;
  categoryId: string | null;
  brand: string | null;
  description: string | null;
  images: string[];
  weightGrams: number | null;
  attributes: Record<string, unknown>;
  price: string;
  stock: number;
  createdAt: string;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductInput {
  name: string;
  price: string;
  stock: number;
  categoryId: string | null;
  brand?: string;
  description?: string;
  images: string[];
  weightGrams?: number;
  attributes: Record<string, unknown>;
}
