import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwtUtils.js";
import { logger } from "../utils/logger.js";
import { failure } from "../utils/httpResponses.js";
import AuditService from "../services/auditService.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";

const auditService = new AuditService();

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn("Token não fornecido");

      auditService.log(
        0,
        "AUTH_FAIL",
        "Token não fornecido"
      );

      return failure(res, 401, "Token não fornecido");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      auditService.log(
        0,
        "AUTH_FAIL",
        "Token inválido"
      );

      return failure(res, 401, "Token inválido");
    }

    const decoded = verifyAccessToken(token) as {
      id: number;
      email: string;
      role: string;
    };

    req.user = decoded;

    logger.info(`Usuário autenticado: ${decoded.email}`);

    auditService.log(
      decoded.id,
      "AUTH_SUCCESS",
      `Usuário autenticado: ${decoded.email}`
    );

    return next();
  } catch (error: unknown) {
    logger.error("Token inválido ou expirado", { error });

    auditService.log(
      0,
      "AUTH_FAIL",
      "Token inválido ou expirado"
    );

    return failure(
      res,
      getErrorStatus(error),
      getErrorMessage(error, "Token inválido ou expirado")
    );
  }
}