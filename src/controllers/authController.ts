import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import { verifyRefreshToken, signAccessToken } from "../utils/jwtUtils.js";
import { logger } from "../utils/logger.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      // validação mínima antes de chamar o service
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios não preenchidos" });
      }
      const result = await authService.register(name, email, password);
      logger.info(`Usuário registrado: ${email}`);
      return res.status(201).json({ success: true, message: "Usuário criado", data: result });
    } catch (error: any) {
      logger.error("Erro ao registrar usuário", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      // checa se email e senha foram enviados
      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email e senha são obrigatórios" });
      }
      const result = await authService.login(email, password);
      logger.info(`Login realizado: ${email}`);
      return res.status(200).json({ success: true, message: "Login realizado", data: result });
    } catch (error: any) {
      logger.warn(`Falha no login: ${req.body.email}`);
      return res.status(error.statusCode || 401).json({ success: false, error: error.message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      // refresh token precisa ser enviado
      if (!refreshToken) {
        return res.status(401).json({ success: false, error: "Refresh token não enviado" });
      }
      const decoded = verifyRefreshToken(refreshToken) as any;
      const newAccessToken = signAccessToken({ id: decoded.id });
      logger.info(`Novo access token gerado para usuário ${decoded.id}`);
      return res.json({ success: true, message: "Token atualizado", data: { accessToken: newAccessToken } });
    } catch (error: any) {
      logger.error("Refresh token inválido", { error });
      return res.status(error.statusCode || 401).json({ success: false, error: error.message });
    }
  }
}
