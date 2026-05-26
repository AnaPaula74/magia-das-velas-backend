import type { Request, Response } from "express";

import DashboardService from "../services/dashboardService.js";
import AuditService from "../services/auditService.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

export class DashboardController {
  constructor(
    private dashboardService = new DashboardService(),
    private auditService = new AuditService()
  ) {}

  async getStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      if (req.user.role !== "admin") {
        return failure(res, 403, "Acesso negado. Apenas administradores podem acessar estatísticas");
      }

      const stats = await this.dashboardService.getStats();

      await this.auditService.log(
        req.user.id,
        "DASHBOARD_STATS_VIEW",
        "Consultou estatísticas do dashboard"
      );

      logger.info(`Estatísticas consultadas pelo usuário ${req.user.id}`);

      return success(res, 200, "Estatísticas retornadas com sucesso", stats);
    } catch (error: unknown) {
      logger.error("Erro ao obter estatísticas", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao obter estatísticas")
      );
    }
  }

  async topProducts(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      if (req.user.role !== "admin") {
        return failure(res, 403, "Acesso negado. Apenas administradores podem acessar relatórios");
      }

      const limit = Math.min(100, Math.max(1, Number(req.query?.limit ?? 10)));

      const result = await this.dashboardService.topProducts(limit);

      await this.auditService.log(
        req.user.id,
        "DASHBOARD_TOP_PRODUCTS_VIEW",
        `Consultou ${limit} produtos mais vendidos`
      );

      logger.info(`Produtos mais vendidos consultados (top ${limit}) pelo usuário ${req.user.id}`);

      return success(res, 200, "Produtos mais vendidos retornados com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao obter produtos mais vendidos", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao obter produtos mais vendidos")
      );
    }
  }

  async getSalesReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      if (req.user.role !== "admin") {
        return failure(res, 403, "Acesso negado. Apenas administradores podem acessar relatórios");
      }

      const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
      const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

      if (startDate && isNaN(startDate.getTime())) {
        return failure(res, 400, "Data de início inválida");
      }

      if (endDate && isNaN(endDate.getTime())) {
        return failure(res, 400, "Data de término inválida");
      }

      if (startDate && endDate && startDate > endDate) {
        return failure(res, 400, "Data de início não pode ser posterior à data de término");
      }

      const report = await this.dashboardService.getSalesReport(startDate, endDate);

      await this.auditService.log(
        req.user.id,
        "DASHBOARD_SALES_REPORT",
        `Relatório de vendas consultado (${startDate?.toISOString() || "sem filtro"} até ${endDate?.toISOString() || "sem filtro"})`
      );

      logger.info(`Relatório de vendas consultado pelo usuário ${req.user.id}`);

      return success(res, 200, "Relatório de vendas retornado com sucesso", report);
    } catch (error: unknown) {
      logger.error("Erro ao obter relatório de vendas", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao obter relatório de vendas")
      );
    }
  }

  async getUserMetrics(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      if (req.user.role !== "admin") {
        return failure(res, 403, "Acesso negado. Apenas administradores podem acessar métricas");
      }

      const metrics = await this.dashboardService.getUserMetrics();

      await this.auditService.log(
        req.user.id,
        "DASHBOARD_USER_METRICS",
        "Consultou métricas de usuários"
      );

      logger.info(`Métricas de usuários consultadas pelo usuário ${req.user.id}`);

      return success(res, 200, "Métricas de usuários retornadas com sucesso", metrics);
    } catch (error: unknown) {
      logger.error("Erro ao obter métricas de usuários", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao obter métricas de usuários")
      );
    }
  }
}

const controller = new DashboardController();
export default controller;
