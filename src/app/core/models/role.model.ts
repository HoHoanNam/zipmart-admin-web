export interface Permission {
  id: string;
  key: string;
  description: string;
  createdAt: string;
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  isSystem: boolean;
  permissionKeys: string[];
}

export interface CreateRoleInput {
  name: string;
}
