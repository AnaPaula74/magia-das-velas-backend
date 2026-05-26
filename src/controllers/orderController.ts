import type { Request, Response } from "express";

import { OrderService } from "../services/orderService.js";
import AuditService from "../services/auditService.js";
import { NotificationService } from "../services/notificationService.js";
import UserService from "../services/userService.js";
import type { CheckoutDTO } from "../dtos/order/checkout.dto.js";
import type { UpdateOrderStatusDTO } from "../dtos/order/updateOrderStatus.dto.js";
import { OrderStatus } from "../enums/orderStatus.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export class OrderController {
  constructor(
    private orderService = new OrderService(),
    private auditService = new AuditService(),
    private notificationService = new NotificationService(),
    private userService = new UserService()
  ) {}

  async checkout(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const dto: CheckoutDTO = {
        userId: req.user.id,
      };

      const order = await this.orderService.checkout(dto);

      await this.auditService.log({
        userId: dto.userId,
        action: "ORDER_CHECKOUT",
        details: `Pedido criado: #${order.orderId}`,
      });

      const user = await this.userService
        .getProfile(req.user.id)
        .catch((error) => {
          logger.warn("Não foi possível consultar usuário para e-mail do pedido", {
            userId: req.user?.id,
            error,
          });
          return null;
        });

      if (user?.email) {
        await this.notificationService.sendEmail({
          to: user.email,
          subject: "Pedido confirmado - Magia das Velas",
          text: `Seu pedido #${order.orderId} foi criado com sucesso.`,
          html: `
            <h2>Pedido Confirmado</h2>
            <p>Seu pedido #${order.orderId} foi criado com sucesso.</p>
            <p>Total: R$ ${order.total?.toFixed(2) || "N/A"}</p>
          `,
        }).catch((error) => {
          logger.error("Erro ao enviar email de confirmação", { orderId: order.orderId, error });
        });
      }

      logger.info(`Pedido #${order.orderId} criado para usuário ${dto.userId}`);

      return success(res, 201, "Pedido criado com sucesso", order);
    } catch (error: unknown) {
      logger.error("Erro ao fazer checkout", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao fazer checkout")
      );
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const orders = await this.orderService.getOrders(req.user.id);

      await this.auditService.log({
        userId: req.user.id,
        action: "ORDER_LIST",
        details: `Consultou pedidos (${orders.length} encontrados)`,
      });

      logger.info(`Pedidos listados para usuário ${req.user.id}: ${orders.length} pedidos`);

      return success(res, 200, "Pedidos listados com sucesso", orders);
    } catch (error: unknown) {
      logger.error("Erro ao listar pedidos", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao listar pedidos")
      );
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado para atualizar pedido");
      }

      const orderId = Number(req.params.id);

      if (isNaN(orderId) || orderId <= 0) {
        return failure(res, 400, "ID do pedido inválido");
      }

      const status = String(req.body.status ?? "").toLowerCase();

      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        return failure(res, 400, `Status inválido. Valores aceitos: ${Object.values(OrderStatus).join(", ")}`);
      }

      const dto: UpdateOrderStatusDTO = {
        orderId,
        status: status as OrderStatus,
      };

      await this.orderService.updateStatus(dto);

      await this.auditService.log({
        userId: req.user.id,
        action: "ORDER_UPDATE_STATUS",
        details: `Pedido #${dto.orderId} atualizado para ${dto.status}`,
      });

      if (env.WEBHOOK_ORDERS_URL) {
        await this.notificationService.sendWebhook({
          url: env.WEBHOOK_ORDERS_URL,
          payload: dto,
        }).catch((error) => {
          logger.error("Erro ao enviar webhook", { orderId: dto.orderId, error });
        });
      }

      logger.info(`Pedido #${orderId} atualizado para ${status} por usuário ${req.user.id}`);

      return success(res, 200, "Status do pedido atualizado com sucesso", dto);
    } catch (error: unknown) {
      logger.error("Erro ao atualizar status do pedido", {
        orderId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao atualizar status do pedido")
      );
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const orderId = Number(req.params.id);

      if (isNaN(orderId) || orderId <= 0) {
        return failure(res, 400, "ID do pedido inválido");
      }

      const order = await this.orderService.getOrderById(orderId, req.user.id);

      logger.info(`Pedido #${orderId} consultado pelo usuário ${req.user.id}`);

      return success(res, 200, "Pedido encontrado", order);
    } catch (error: unknown) {
      logger.error("Erro ao consultar pedido", { orderId: req.params.id, userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao consultar pedido")
      );
    }
  }
}

const controller = new OrderController();
export default controller;
