import "../setup.js";
import { jest } from "@jest/globals";
import { DashboardController } from "../../controllers/dashboardController.js";
import DashboardService from "../../services/dashboardService.js";
import AuditService from "../../services/auditService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;

  return res;
};

describe("DashboardController", () => {
  let controller: DashboardController;

  beforeEach(() => {
    controller = new DashboardController();

    jest.clearAllMocks();

    jest.spyOn(AuditService.prototype, "log").mockResolvedValue();
  });

  it("retorna estatísticas", async () => {
    const getStatsSpy = jest.spyOn(DashboardService.prototype, "getStats").mockResolvedValue({
      users: 10,
      sales: 20,
    } as any);

    const req: any = {
      user: {
        id: 1,
        role: "admin",
      },
    };
    const res = mockResponse();

    await controller.getStats(req, res);

    expect(getStatsSpy).toHaveBeenCalledTimes(1);
    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      1,
      "DASHBOARD_STATS_VIEW",
      "Consultou estatísticas do dashboard"
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("retorna produtos mais vendidos", async () => {
    const topProductsSpy = jest.spyOn(DashboardService.prototype, "topProducts").mockResolvedValue([
      {
        id: 1,
        name: "Vela",
      },
    ] as any);

    const req: any = {
      user: {
        id: 1,
        role: "admin",
      },
      query: {
        limit: 5,
      },
    };
    const res = mockResponse();

    await controller.topProducts(req, res);

    expect(topProductsSpy).toHaveBeenCalledWith(5);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("retorna 401 sem usuário autenticado", async () => {
    const getStatsSpy = jest.spyOn(DashboardService.prototype, "getStats");

    const req: any = {};
    const res = mockResponse();

    await controller.getStats(req, res);

    expect(getStatsSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Usuário não autenticado",
    });
  });

  it("retorna 403 para usuário que não é admin", async () => {
    const topProductsSpy = jest.spyOn(DashboardService.prototype, "topProducts");

    const req: any = {
      user: {
        id: 1,
        role: "user",
      },
      query: {},
    };
    const res = mockResponse();

    await controller.topProducts(req, res);

    expect(topProductsSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Acesso negado. Apenas administradores podem acessar relatórios",
    });
  });
});
