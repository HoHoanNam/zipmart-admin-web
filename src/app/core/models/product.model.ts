export interface Product {
  id: string;
  name: string;
  categoryId: string | null;
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
  categoryId?: string | null;
}
