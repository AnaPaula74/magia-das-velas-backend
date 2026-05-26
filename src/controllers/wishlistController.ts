import type { Request, Response } from "express";

import { WishlistService } from "../services/wishlistService.js";
import AuditService from "../services/auditService.js";
import type { AddWishlistDTO } from "../dtos/wishlist/addWishlist.dto.js";
import type { RemoveWishlistItemDTO } from "../dtos/wishlist/removeWishlistItem.dto.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

export class WishlistController {
  constructor(
    private wishlistService = new WishlistService(),
    private auditService = new AuditService()
  ) {}

  async add(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const productId = Number(req.body.productId);

      if (isNaN(productId) || productId <= 0) {
        return failure(res, 400, "ID do produto inválido");
      }

      const dto: AddWishlistDTO = {
        userId: req.user.id,
        productId,
      };

      const result = await this.wishlistService.add(dto);

      await this.auditService.log(
        dto.userId,
        "WISHLIST_ADD",
        `Produto ${dto.productId} adicionado aos favoritos`
      );

      logger.info(`Produto ${productId} adicionado aos favoritos do usuário ${req.user.id}`);

      return success(res, 201, "Adicionado aos favoritos com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao adicionar à wishlist", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao adicionar aos favoritos")
      );
    }
  }

  async remove(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const productId = Number(req.params.productId);

      if (isNaN(productId) || productId <= 0) {
        return failure(res, 400, "ID do produto inválido");
      }

      const dto: RemoveWishlistItemDTO = {
        userId: req.user.id,
        productId,
      };

      const result = await this.wishlistService.remove(dto);

      await this.auditService.log(
        dto.userId,
        "WISHLIST_REMOVE",
        `Produto ${dto.productId} removido dos favoritos`
      );

      logger.info(`Produto ${productId} removido dos favoritos do usuário ${req.user.id}`);

      return success(res, 200, "Removido dos favoritos com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao remover da wishlist", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao remover dos favoritos")
      );
    }
  }

  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const result = await this.wishlistService.list(req.user.id);

      await this.auditService.log(
        req.user.id,
        "WISHLIST_VIEW",
        `Consultou wishlist (${result.items?.length || 0} itens)`
      );

      logger.info(`Wishlist consultada para usuário ${req.user.id}`);

      return success(res, 200, "Wishlist listada com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao listar wishlist", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao listar wishlist")
      );
    }
  }

  async checkIfExists(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const productId = Number(req.params.productId);

      if (isNaN(productId) || productId <= 0) {
        return failure(res, 400, "ID do produto inválido");
      }

      const exists = await this.wishlistService.exists(req.user.id, productId);

      logger.info(`Verificação de favorito para produto ${productId} do usuário ${req.user.id}`);

      return success(res, 200, "Verificação concluída", { exists });
    } catch (error: unknown) {
      logger.error("Erro ao verificar wishlist", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao verificar wishlist")
      );
    }
  }
}

const controller = new WishlistController();
export default controller;