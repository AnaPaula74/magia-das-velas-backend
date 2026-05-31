import type { Request, Response } from "express";
import { PosService } from "../services/posService.js";
import AuditService from "../services/auditService.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";
import type { CreatePosSaleDTO } from "../dtos/pos/createPosSale.dto.js";

export class PosController {
  constructor(
    private posService = new PosService(),
    private auditService = new AuditService()
  ) {}

  async createSale(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const dto: CreatePosSaleDTO = {
        customerName: req.body.customerName?.trim() ?? null,
        customerPhone: req.body.customerPhone?.trim() ?? null,
        paymentMethod: req.body.paymentMethod,
        items: Array.isArray(req.body.items) ? req.body.items : [],
      };

      const result = await this.posService.createSale(dto, req.user.id);

      await this.auditService.log(
        req.user.id,
        "POS_SALE_CREATE",
        `Venda POS criada: ${result.orderId}`
      );

      return success(res, 201, "Venda criada com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao criar venda POS", {
        userId: req.user?.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao criar venda POS")
      );
    }
  }

  async getSales(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const filters: { paymentMethod?: string; status?: string } = {};

      const paymentMethod = String(req.query.paymentMethod ?? "").trim();
      if (paymentMethod) {
        filters.paymentMethod = paymentMethod;
      }

      const status = String(req.query.status ?? "").trim();
      if (status) {
        filters.status = status;
      }

      const sales = await this.posService.getSales(req.user.id, req.user.role, filters);

      return success(res, 200, "Vendas POS listadas com sucesso", sales);
    } catch (error: unknown) {
      logger.error("Erro ao listar vendas POS", {
        userId: req.user?.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao listar vendas POS")
      );
    }
  }

  async getSaleById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const orderId = Number(req.params.id);

      const sale = await this.posService.getSaleById(orderId, req.user.id, req.user.role);

      return success(res, 200, "Venda POS encontrada", sale);
    } catch (error: unknown) {
      logger.error("Erro ao buscar venda POS", {
        userId: req.user?.id,
        saleId: req.params.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao buscar venda POS")
      );
    }
  }

  async cancelSale(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const orderId = Number(req.params.id);

      const result = await this.posService.cancelSale(orderId);

      await this.auditService.log(
        req.user.id,
        "POS_SALE_CANCEL",
        `Venda POS cancelada: ${orderId}`
      );

      return success(res, 200, "Venda cancelada com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao cancelar venda POS", {
        userId: req.user?.id,
        saleId: req.params.id,
        error,
      });

      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao cancelar venda POS")
      );
    }
  }
}

const controller = new PosController();
export default controller;
