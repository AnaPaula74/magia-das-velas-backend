// testes do DashboardController
import { jest } from "@jest/globals";
import { DashboardController } from "../../controllers/dashboardController.js";
import DashboardService from "../../services/dashboardService.js";
import type { Request, Response } from "express";

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res) as Response["status"];
  res.json = jest.fn().mockReturnValue(res) as Response["json"];
  return res as Response;
};

describe("DashboardController", () => {
  let controller: DashboardController;

  beforeEach(() => {
    controller = new DashboardController();
    jest.clearAllMocks();
  });

  it("retorna estatísticas", async () => {
    jest.spyOn(DashboardService.prototype, "getStats").mockResolvedValue({ users: 10, orders: 5 } as any);

    const res = mockResponse();
    await controller.getStats({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: { users: 10, orders: 5 } });
  });

  it("retorna produtos mais vendidos", async () => {
    jest.spyOn(DashboardService.prototype, "topProducts").mockResolvedValue([{ id: 1, name: "Produto A" }] as any);

    const res = mockResponse();
    await controller.topProducts({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 1, name: "Produto A" }] });
  });
});
