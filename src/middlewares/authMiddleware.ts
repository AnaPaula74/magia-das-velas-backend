import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwtUtils.js";
import { logger } from "../utils/logger.js";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    // token precisa estar presente
    if (!authHeader) {
      logger.warn("Token não fornecido");
      return res.status(401).json({ success: false, error: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, error: "Token inválido" });
    }

    const decoded = verifyAccessToken(token) as any;
    req.user = decoded;

    logger.info(`Usuário autenticado: ${decoded.email}`);
    next();
  } catch (error: any) {
    logger.error("Token inválido ou expirado", { error });
    return res.status(error.statusCode || 401).json({ success: false, error: error.message });
  }
}
