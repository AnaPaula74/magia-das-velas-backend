import type { Request, Response } from "express";

import UserService from "../services/userService.js";
import AuditService from "../services/auditService.js";
import type { UpdateProfileDTO } from "../dtos/user/updateProfile.dto.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

export class UserController {
  constructor(
    private userService = new UserService(),
    private auditService = new AuditService()
  ) {}

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const dto: UpdateProfileDTO = {
        userId: req.user.id,
        ...req.body,
      };

      await this.userService.updateProfile(dto);

      await this.auditService.log(
        dto.userId,
        "USER_PROFILE_UPDATE",
        "Perfil atualizado"
      );

      logger.info(`Perfil atualizado para usuário ${dto.userId}`);

      return success(res, 200, "Perfil atualizado com sucesso");
    } catch (error: unknown) {
      logger.error("Erro ao atualizar perfil", {
        userId: req.user?.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao atualizar perfil")
      );
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const user = await this.userService.getProfile(req.user.id);

      logger.info(`Perfil consultado para usuário ${req.user.id}`);

      return success(res, 200, "Perfil retornado", user);
    } catch (error: unknown) {
      logger.error("Erro ao consultar perfil", {
        userId: req.user?.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao consultar perfil")
      );
    }
  }
}

const controller = new UserController();

export const updateProfile = (req: Request, res: Response) =>
  controller.updateProfile(req, res);

export const getProfile = (req: Request, res: Response) =>
  controller.getProfile(req, res);

export default controller;