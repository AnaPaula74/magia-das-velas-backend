import type { Request, Response, NextFunction } from "express";
import { failure } from "../utils/httpResponses.js";
import AuditService from "../services/auditService.js";
import { logger } from "../utils/logger.js";

const auditService = new AuditService();

export function roleMiddleware(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      logger.warn("Tentativa de acesso sem autenticação");
      auditService.log(0, "ROLE_ACCESS_FAIL", "Tentativa sem autenticação");
      return failure(res, 401, "Não autenticado");
    }

    if (user.role === "admin" || allowedRoles.includes(user.role)) {
      logger.info(`Acesso autorizado para usuário ${user.id} com role ${user.role}`);
      return next();
    }

    logger.warn(`Acesso negado para usuário ${user.id} com role ${user.role}`);
    auditService.log(user.id, "ROLE_ACCESS_DENIED", `Acesso negado para role ${user.role}`);
    return failure(res, 403, "Acesso negado");
  };
}
