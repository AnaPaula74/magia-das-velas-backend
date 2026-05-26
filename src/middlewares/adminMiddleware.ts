import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { failure } from "../utils/httpResponses.js";
import AuditService from "../services/auditService.js";

const auditService = new AuditService();

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user) {
    logger.warn("Tentativa de acesso sem autenticação");
    auditService.log(0, "ADMIN_ACCESS_FAIL", "Tentativa sem autenticação");
    return failure(res, 401, "Não autenticado");
  }

  if (user.role !== "admin") {
    logger.warn(`Acesso negado para usuário ${user.id}`);
    auditService.log(user.id, "ADMIN_ACCESS_DENIED", "Usuário não é admin");
    return failure(res, 403, "Acesso negado");
  }

  logger.info(`Acesso admin autorizado para usuário ${user.id}`);
  auditService.log(user.id, "ADMIN_ACCESS_GRANTED", "Acesso autorizado");
  next();
}
