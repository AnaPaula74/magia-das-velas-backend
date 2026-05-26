import type { Request, Response } from "express";

import CartService from "../services/cartService.js";
import AuditService from "../services/auditService.js";
import type { AddCartItemDTO } from "../dtos/cart/addCartItem.dto.js";
import type { UpdateCartItemDTO } from "../dtos/cart/updateCartItem.dto.js";
import type { RemoveCartItemDTO } from "../dtos/cart/removeCartItem.dto.js";
import type { GetCartDTO } from "../dtos/cart/getCart.dto.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

export class CartController {
  constructor(
    private cartService = new CartService(),
    private auditService = new AuditService()
  ) {}

  async add(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const productId = Number(req.body.productId);
      const quantity = Number(req.body.quantity);

      if (isNaN(productId) || productId <= 0) {
        return failure(res, 400, "ID do produto inválido");
      }

      if (isNaN(quantity) || quantity <= 0) {
        return failure(res, 400, "Quantidade deve ser maior que zero");
      }

      if (quantity > 999) {
        return failure(res, 400, "Quantidade máxima excedida");
      }

      const dto: AddCartItemDTO = {
        userId: req.user.id,
        productId,
        quantity,
      };

      const result = await this.cartService.addToCart(
        dto.userId,
        dto.productId,
        dto.quantity
      );

      await this.auditService.log(
        dto.userId,
        "CART_ADD",
        `Produto ${dto.productId} adicionado ao carrinho`
      );

      logger.info(`Produto ${productId} adicionado ao carrinho do usuário ${req.user.id}`);

      return success(res, 201, "Produto adicionado ao carrinho", result);
    } catch (error: unknown) {
      logger.error("Erro ao adicionar produto ao carrinho", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao adicionar produto ao carrinho")
      );
    }
  }

  async get(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const dto: GetCartDTO = {
        userId: req.user.id,
      };

      const cart = await this.cartService.getCart(dto.userId);

      await this.auditService.log(
        dto.userId,
        "CART_GET",
        "Consultou carrinho"
      );

      logger.info(`Carrinho consultado para usuário ${req.user.id}`);

      return success(res, 200, "Carrinho retornado", cart);
    } catch (error: unknown) {
      logger.error("Erro ao obter carrinho", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao obter carrinho")
      );
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const cartItemId = Number(req.params.id);
      const quantity = Number(req.body.quantity);

      if (isNaN(cartItemId) || cartItemId <= 0) {
        return failure(res, 400, "ID do item do carrinho inválido");
      }

      if (isNaN(quantity) || quantity <= 0) {
        return failure(res, 400, "Quantidade deve ser maior que zero");
      }

      if (quantity > 999) {
        return failure(res, 400, "Quantidade máxima excedida");
      }

      const dto: UpdateCartItemDTO = {
        userId: req.user.id,
        cartItemId,
        quantity,
      };

      const result = await this.cartService.updateQuantity(
        dto.userId,
        dto.cartItemId,
        dto.quantity
      );

      await this.auditService.log(
        dto.userId,
        "CART_UPDATE",
        `Item ${dto.cartItemId} atualizado no carrinho`
      );

      logger.info(`Item ${cartItemId} do carrinho atualizado para ${quantity} unidades`);

      return success(res, 200, "Quantidade atualizada", result);
    } catch (error: unknown) {
      logger.error("Erro ao atualizar item do carrinho", {
        cartItemId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao atualizar quantidade")
      );
    }
  }

  async remove(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const cartItemId = Number(req.params.id);

      if (isNaN(cartItemId) || cartItemId <= 0) {
        return failure(res, 400, "ID do item do carrinho inválido");
      }

      const dto: RemoveCartItemDTO = {
        userId: req.user.id,
        cartItemId,
      };

      const result = await this.cartService.removeFromCart(
        dto.userId,
        dto.cartItemId
      );

      await this.auditService.log(
        dto.userId,
        "CART_REMOVE",
        `Item ${dto.cartItemId} removido do carrinho`
      );

      logger.info(`Item ${cartItemId} removido do carrinho do usuário ${req.user.id}`);

      return success(res, 200, "Item removido do carrinho", result);
    } catch (error: unknown) {
      logger.error("Erro ao remover item do carrinho", {
        cartItemId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao remover item do carrinho")
      );
    }
  }

  async clear(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      await this.cartService.clearCart(req.user.id);

      await this.auditService.log(
        req.user.id,
        "CART_CLEAR",
        "Carrinho limpo"
      );

      logger.info(`Carrinho limpo para usuário ${req.user.id}`);

      return success(res, 200, "Carrinho limpo com sucesso");
    } catch (error: unknown) {
      logger.error("Erro ao limpar carrinho", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao limpar carrinho")
      );
    }
  }
}

const controller = new CartController();
export default controller;
