import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import { logger } from "../utils/logger.js";

export class AuthController {
  constructor(private authService: AuthService = new AuthService()) {}

  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const result = await this.authService.register(name, email, password);
      logger.info(`Usuário registrado: ${email}`);
      return res.status(201).json({ success: true, message: "Usuário criado", data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: "Erro ao registrar usuário" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      logger.info(`Login realizado: ${email}`);
      return res.status(200).json({ success: true, message: "Login realizado", data: result });
    } catch (error: any) {
      return res.status(401).json({ success: false, error: error.message || "Credenciais inválidas" });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ success: false, error: "Refresh token não enviado" });
      }
      const decoded = this.authService.verifyRefreshToken(refreshToken) as any;
      const newAccessToken = this.authService.signAccessToken({ id: decoded.id });
      return res.json({ success: true, message: "Token atualizado", data: { accessToken: newAccessToken } });
    } catch {
      return res.status(401).json({ success: false, error: "Token inválido ou expirado" });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      logger.info(`Solicitação de recuperação de senha para: ${email}`);
      return res.json({ success: true, message: "E-mail de recuperação enviado" });
    } catch (error: any) {
      return res.status(404).json({ success: false, error: error.message || "Usuário não encontrado" });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);
      logger.info(`Senha redefinida com token válido`);
      return res.json({ success: true, message: "Senha redefinida com sucesso" });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message || "Token inválido ou expirado" });
    }
  }
}
