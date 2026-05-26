import type { Request, Response } from "express";

import AuthService from "../services/authService.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

import type { RegisterDTO } from "../dtos/auth/register.dto.js";
import type { LoginDTO } from "../dtos/auth/login.dto.js";
import type { ResetPasswordDTO } from "../dtos/auth/resetPassword.dto.js";

export class AuthController {
  constructor(private authService = new AuthService()) {}

  async register(req: Request, res: Response) {
    try {
      const dto: RegisterDTO = req.body;

      const result = await this.authService.register(dto);

      logger.info(`Novo usuário registrado: ${dto.email}`);

      return success(res, 201, "Usuário registrado com sucesso", {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error: unknown) {
      logger.error("Erro ao registrar usuário", { error });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao registrar usuário")
      );
    }
  }

  async login(req: Request, res: Response) {
    try {
      const dto: LoginDTO = req.body;

      const result = await this.authService.login(dto);

      logger.info(`Login realizado: ${dto.email}`);

      return success(res, 200, "Login realizado com sucesso", {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error: unknown) {
      logger.error("Erro ao fazer login", { error });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao fazer login")
      );
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const tokens = await this.authService.refresh(refreshToken);

      logger.info("Refresh token rotacionado");

      return success(res, 200, "Token renovado com sucesso", tokens);
    } catch (error: unknown) {
      logger.error("Erro ao renovar token", { error });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao renovar token")
      );
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      await this.authService.logout(refreshToken);

      logger.info("Logout realizado");

      return success(res, 200, "Logout realizado com sucesso");
    } catch (error: unknown) {
      logger.error("Erro ao fazer logout", { error });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao fazer logout")
      );
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const result = await this.authService.forgotPassword(email);

      logger.info(`Solicitação de recuperação de senha para: ${email}`);

      return success(res, 200, result.message);
    } catch (error: unknown) {
      logger.error("Erro ao solicitar recuperação de senha", { error });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao solicitar recuperação de senha")
      );
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const dto: ResetPasswordDTO = req.body;

      const result = await this.authService.resetPassword(
        dto.token,
        dto.password
      );

      logger.info("Senha redefinida com sucesso");

      return success(res, 200, result.message);
    } catch (error: unknown) {
      logger.error("Erro ao redefinir senha", { error });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao redefinir senha")
      );
    }
  }
}

const controller = new AuthController();
export default controller;