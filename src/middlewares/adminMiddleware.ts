import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = req.user;

  // bloqueia acesso sem autenticação
  if (!user) {
    logger.warn("Tentativa de acesso sem autenticação");
    return res.status(401).json({ success: false, error: "Não autenticado" });
  }

  // bloqueia se não for admin
  if (user.role !== "admin") {
    logger.warn(`Acesso negado para usuário ${user.id}`);
    return res.status(403).json({ success: false, error: "Acesso negado" });
  }

  logger.info(`Acesso admin autorizado para usuário ${user.id}`);
  next();
}
