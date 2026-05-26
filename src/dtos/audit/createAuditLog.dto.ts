export interface CreateAuditLogDTO {
  userId: number | null;
  action: string;
  details: string;
}
