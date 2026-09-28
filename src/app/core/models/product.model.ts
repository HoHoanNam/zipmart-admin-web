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
  originalPrice: string | null;
  stock: number;
  lowStockThreshold: number | null;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
  soldCount?: number;
  variants?: ProductVariant[];
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  sku: string;
  price: string | null;
  stock: number;
}

export interface VariantInput {
  size?: string;
  color?: string;
  sku: string;
  price?: string;
  stock: number;
}

export interface CreateProductInput {
  name: string;
  price: string;
  originalPrice?: string;
  stock: number;
  categoryId: string | null;
  brand?: string;
  description?: string;
  images: string[];
  weightGrams?: number;
  attributes: Record<string, unknown>;
  variants?: VariantInput[];
}
