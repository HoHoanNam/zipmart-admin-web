export type UserRole = 'customer' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
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
