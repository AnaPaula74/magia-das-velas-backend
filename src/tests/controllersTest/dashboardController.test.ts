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
    jest.spyOn(DashboardService.prototype, "getStats").mockResolvedValue({
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

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("retorna produtos mais vendidos", async () => {
    jest.spyOn(DashboardService.prototype, "topProducts").mockResolvedValue([
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
    };
    const res = mockResponse();

    await controller.topProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
