import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { CustomError } from "../errors/customErrors.js";

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error("Erro capturado pelo middleware", { error: err });

  // trata erros customizados com status definido
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  const status = err.statusCode || 500;
  const message = err.message || "Erro interno no servidor";

  res.status(status).json({ success: false, error: message });
}
