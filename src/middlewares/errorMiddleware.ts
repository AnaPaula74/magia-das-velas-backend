import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { CustomError } from "../errors/customErrors.js";
import { failure } from "../utils/httpResponses.js";
import AuditService from "../services/auditService.js";

const auditService = new AuditService();

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error("Erro capturado pelo middleware", { error: err });

  if (err instanceof CustomError) {
    auditService.log(0, "ERROR", `Erro customizado: ${err.message}`);
    return failure(res, err.statusCode, err.message);
  }

  const status = err.statusCode || 500;
  const message = err.message || "Erro interno no servidor";

  auditService.log(0, "ERROR", `Erro interno: ${message}`);
  return failure(res, status, message);
}
