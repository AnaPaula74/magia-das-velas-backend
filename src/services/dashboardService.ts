import { ValidationError } from "../errors/customErrors.js";
import DashboardRepository from "../repositories/dashboardRepository.js";

export default class DashboardService {
  constructor(private dashboardRepository = new DashboardRepository()) {}

  async getStats() {
    const stats = await this.dashboardRepository.getStats();

    if (!stats) {
      throw new ValidationError("Não foi possível calcular estatísticas");
    }

    return stats;
  }

  async topProducts(limit = 5) {
    const rows = await this.dashboardRepository.topProducts(limit);

    if (!rows.length) {
      throw new ValidationError("Nenhum produto vendido encontrado");
    }

    return rows;
  }

  async getSalesReport(startDate?: Date, endDate?: Date) {
    if (startDate && endDate && startDate > endDate) {
      throw new ValidationError("Data inicial não pode ser maior que a data final");
    }

    const report = await this.dashboardRepository.getSalesReport(startDate, endDate);

    if (!report) {
      throw new ValidationError("Não foi possível gerar relatório de vendas");
    }

    return report;
  }

  async getUserMetrics() {
    const metrics = await this.dashboardRepository.getUserMetrics();

    if (!metrics) {
      throw new ValidationError("Não foi possível calcular métricas de usuários");
    }

    return metrics;
  }
}
