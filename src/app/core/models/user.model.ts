export type UserRole = 'customer' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  /** Bridge column from the RBAC migration (Infra A) — null for accounts that predate it and haven't been backfilled/reassigned. */
  roleId: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
