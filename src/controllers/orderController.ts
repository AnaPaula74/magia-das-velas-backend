import type { Request, Response } from "express";

import { OrderService } from "../services/orderService.js";
import AuditService from "../services/auditService.js";

import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

import type { CheckoutDTO } from "../dtos/order/checkout.dto.js";
import type { UpdateOrderStatusDTO } from "../dtos/order/updateOrderStatus.dto.js";
import type { OrderStatus } from "../enums/orderStatus.js";

export class OrderController {
  constructor(
    private orderService = new OrderService(),
    private auditService = new AuditService()
  ) {}

  async checkout(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const dto: CheckoutDTO = {
        userId: req.user.id,
      };

      const result = await this.orderService.checkout(dto);

      await this.auditService.log(
        dto.userId,
        "ORDER_CHECKOUT",
        `Pedido criado: ${result.orderId}`
      );

      return success(res, 201, "Pedido criado com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao finalizar pedido", {
        userId: req.user?.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao finalizar pedido")
      );
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const orders = await this.orderService.getOrders(req.user.id);

      return success(res, 200, "Pedidos listados com sucesso", orders);
    } catch (error: unknown) {
      logger.error("Erro ao listar pedidos", {
        userId: req.user?.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao listar pedidos")
      );
    }
  }

  async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await this.orderService.getAllOrders();

      await this.auditService.log(
        req.user?.id ?? null,
        "ADMIN_ORDER_LIST",
        "Admin listou todos os pedidos"
      );

      return success(res, 200, "Pedidos listados com sucesso", orders);
    } catch (error: unknown) {
      logger.error("Erro ao listar pedidos admin", {
        userId: req.user?.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao listar pedidos")
      );
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const orderId = Number(req.params.id);

      const order = await this.orderService.getOrderById(
        orderId,
        req.user.id
      );

      return success(res, 200, "Pedido retornado com sucesso", order);
    } catch (error: unknown) {
      logger.error("Erro ao buscar pedido", {
        userId: req.user?.id,
        orderId: req.params.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao buscar pedido")
      );
    }
  }

  async getOrderByIdForAdmin(req: Request, res: Response) {
    try {
      const orderId = Number(req.params.id);

      const order = await this.orderService.getOrderByIdForAdmin(orderId);

      await this.auditService.log(
        req.user?.id ?? null,
        "ADMIN_ORDER_VIEW",
        `Admin consultou pedido ${orderId}`
      );

      return success(res, 200, "Pedido retornado com sucesso", order);
    } catch (error: unknown) {
      logger.error("Erro ao buscar pedido admin", {
        userId: req.user?.id,
        orderId: req.params.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao buscar pedido")
      );
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const orderId = Number(req.params.id);

      const dto: UpdateOrderStatusDTO = {
        orderId,
        status: req.body.status as OrderStatus,
      };

      const result = await this.orderService.updateStatus(dto);

      await this.auditService.log(
        req.user?.id ?? null,
        "ADMIN_ORDER_STATUS_UPDATE",
        `Status do pedido ${orderId} atualizado para ${dto.status}`
      );

      return success(res, 200, "Status atualizado com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao atualizar status do pedido", {
        userId: req.user?.id,
        orderId: req.params.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao atualizar status")
      );
    }
  }
}

const controller = new OrderController();

export default controller;
