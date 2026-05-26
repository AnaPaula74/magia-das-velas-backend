import AuditRepository from "../repositories/auditRepository.js";
import type { CreateAuditLogDTO } from "../dtos/audit/createAuditLog.dto.js";
import { logger } from "../utils/logger.js";

export default class AuditService {
  constructor(private auditRepository = new AuditRepository()) {}

  async log(dto: CreateAuditLogDTO): Promise<void>;
  async log(userId: number | null, action: string, details: string): Promise<void>;

  async log(
    input: CreateAuditLogDTO | number | null,
    action?: string,
    details?: string
  ): Promise<void> {
    try {
      if (typeof input === "object" && input !== null) {
        await this.auditRepository.create(
          this.normalizeUserId(input.userId),
          input.action,
          input.details
        );
        return;
      }

      await this.auditRepository.create(
        this.normalizeUserId(input),
        action ?? "",
        details ?? ""
      );
    } catch (error) {
      logger.error("Erro ao registrar auditoria", { error, action });
    }
  }

  private normalizeUserId(userId: number | null): number | null {
    return userId && userId > 0 ? userId : null;
  }
}
