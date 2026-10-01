/** Written by the backend's `AuditInterceptor` (global `APP_INTERCEPTOR`) on handlers marked `@Audit('<entityType>')`. */
export interface AuditLog {
  id: string;
  actorUserId: string;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogFilter {
  actor?: string;
  entityType?: string;
  from?: string;
  to?: string;
}
