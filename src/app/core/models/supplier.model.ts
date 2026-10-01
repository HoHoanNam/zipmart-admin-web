export interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
}

export interface CreateSupplierInput {
  name: string;
  contactName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

export type UpdateSupplierInput = Partial<CreateSupplierInput>;
