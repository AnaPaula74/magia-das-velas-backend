import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { CustomError } from "../errors/customErrors.js";
import { failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import AuditService from "../services/auditService.js";

const auditService = new AuditService();

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error("Erro capturado pelo middleware", { error: err });

  if (err instanceof CustomError) {
    auditService.log(0, "ERROR", `Erro customizado: ${err.message}`);
    return failure(res, err.statusCode, err.message);
  }

  const status = getErrorStatus(err);
  const message = getErrorMessage(err);

  auditService.log(0, "ERROR", `Erro interno: ${message}`);
  return failure(res, status, message);
}
