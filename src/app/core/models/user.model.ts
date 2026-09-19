export type UserRole = 'customer' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
