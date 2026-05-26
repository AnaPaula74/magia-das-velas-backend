import type { Request, Response } from "express";

import { PaymentService } from "../services/paymentService.js";
import AuditService from "../services/auditService.js";
import type { CreatePixPaymentDTO } from "../dtos/payment/createPixPayment.dto.js";
import type { CreateMercadoPagoPaymentDTO } from "../dtos/payment/createMercadoPagoPayment.dto.js";
import { validateMercadoPagoWebhook } from "../utils/mercadoPagoWebhook.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

export class PaymentController {
  constructor(
    private paymentService = new PaymentService(),
    private auditService = new AuditService()
  ) {}

  async createPixPayment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const orderId = Number(req.body.orderId);

      if (isNaN(orderId) || orderId <= 0) {
        return failure(res, 400, "ID do pedido inválido");
      }

      const dto: CreatePixPaymentDTO = {
        userId: req.user.id,
        orderId,
      };

      const pixData = await this.paymentService.generatePixMercadoPago(dto);

      await this.auditService.log(
        dto.userId,
        "PIX_PAYMENT",
        `Pagamento Pix criado para pedido ${dto.orderId}`
      );

      logger.info(`Pagamento Pix criado para pedido ${orderId} do usuário ${req.user.id}`);

      return success(res, 201, "Pagamento Pix criado", pixData);
    } catch (error: unknown) {
      logger.error("Erro ao criar pagamento Pix", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao criar pagamento Pix")
      );
    }
  }

  async createMercadoPagoPayment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const orderId = Number(req.body.orderId);

      if (isNaN(orderId) || orderId <= 0) {
        return failure(res, 400, "ID do pedido inválido");
      }

      const dto: CreateMercadoPagoPaymentDTO = {
        userId: req.user.id,
        orderId,
      };

      const paymentData = await this.paymentService.generateMercadoPago(dto);

      await this.auditService.log(
        dto.userId,
        "MERCADO_PAGO_PAYMENT",
        `Checkout Mercado Pago criado para pedido ${dto.orderId}`
      );

      logger.info(
        `Checkout Mercado Pago criado para pedido ${orderId} do usuário ${req.user.id}`
      );

      return success(res, 201, "Checkout Mercado Pago criado", paymentData);
    } catch (error: unknown) {
      logger.error("Erro ao criar pagamento Mercado Pago", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao criar pagamento Mercado Pago")
      );
    }
  }

  async getPaymentStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const paymentId = String(req.params.id ?? "").trim();

      if (!paymentId) {
        return failure(res, 400, "ID do pagamento inválido");
      }

      const status = await this.paymentService.getPaymentStatus(paymentId, req.user.id);

      logger.info(`Status do pagamento ${paymentId} consultado pelo usuário ${req.user.id}`);

      return success(res, 200, "Status do pagamento retornado com sucesso", status);
    } catch (error: unknown) {
      logger.error("Erro ao consultar status do pagamento", {
        paymentId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao consultar status do pagamento")
      );
    }
  }

  async handleWebhook(req: Request, res: Response) {
    try {
      try {
        validateMercadoPagoWebhook(req);
      } catch (error: unknown) {
        logger.warn("Webhook com assinatura inválida recebido", { error });
        return failure(
          res,
          getErrorStatus(error),
          getErrorMessage(error, "Webhook sem assinatura válida")
        );
      }

      const webhookId = req.body?.id ?? req.body?.data?.id;

      if (!req.body || !webhookId) {
        logger.warn("Webhook sem dados válidos recebido");
        return failure(res, 400, "Dados do webhook inválidos");
      }

      await this.paymentService.processWebhook(req.body);

      await this.auditService.log(
        0,
        "WEBHOOK",
        "Webhook Mercado Pago processado"
      );

      logger.info(`Webhook Mercado Pago processado: ${webhookId}`);

      return success(res, 200, "Webhook processado");
    } catch (error: unknown) {
      logger.error("Erro ao processar webhook", { error });
      return success(res, 200, "Webhook recebido");
    }
  }

  async cancelPayment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const paymentId = String(req.params.id ?? "").trim();

      if (!paymentId) {
        return failure(res, 400, "ID do pagamento inválido");
      }

      const result = await this.paymentService.cancelPayment(paymentId, req.user.id);

      await this.auditService.log(
        req.user.id,
        "PAYMENT_CANCELLED",
        `Pagamento ${paymentId} cancelado`
      );

      logger.info(`Pagamento ${paymentId} cancelado pelo usuário ${req.user.id}`);

      return success(res, 200, "Pagamento cancelado com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao cancelar pagamento", {
        paymentId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao cancelar pagamento")
      );
    }
  }
}

const controller = new PaymentController();
export default controller;
