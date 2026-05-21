import type { Request, Response } from "express";
import DashboardService from "../services/dashboardService.js";
import { logger } from "../utils/logger.js";

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(_req: Request, res: Response) {
    try {
      const stats = await dashboardService.getStats();
      logger.info("Dashboard consultado");
      return res.json({ success: true, data: stats });
    } catch (error: any) {
      logger.error("Erro ao buscar dashboard", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async topProducts(_req: Request, res: Response) {
    try {
      const result = await dashboardService.topProducts();
      logger.info("Produtos mais vendidos consultados");
      return res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error("Erro ao buscar produtos mais vendidos", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }
}
