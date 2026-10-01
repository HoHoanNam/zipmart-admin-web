export type StaffInviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface StaffInvite {
  id: string;
  email: string;
  roleId: string;
  roleName?: string;
  status: StaffInviteStatus;
  invitedByUserId: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
}

export interface CreateStaffInviteInput {
  email: string;
  roleId: string;
}
