import "../setup.js";
import { jest } from "@jest/globals";
import { OrderController } from "../../controllers/orderController.js";
import { OrderService } from "../../services/orderService.js";
import AuditService from "../../services/auditService.js";
import { NotificationService } from "../../services/notificationService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;

  return res;
};

describe("OrderController", () => {
  let controller: OrderController;

  beforeEach(() => {
    controller = new OrderController();

    jest.clearAllMocks();

    jest.spyOn(AuditService.prototype, "log").mockResolvedValue();

    jest
      .spyOn(NotificationService.prototype, "sendEmail")
      .mockResolvedValue();

    jest
      .spyOn(NotificationService.prototype, "sendWebhook")
      .mockResolvedValue();
  });

  it("faz checkout", async () => {
    jest.spyOn(OrderService.prototype, "checkout").mockResolvedValue({
      orderId: 1,
    } as any);

    const req: any = {
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.checkout(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("lista pedidos", async () => {
    jest.spyOn(OrderService.prototype, "getOrders").mockResolvedValue([
      {
        id: 1,
      },
    ] as any);

    const req: any = {
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.getOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});