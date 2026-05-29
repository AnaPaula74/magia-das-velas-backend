import "../setup.js";
import { jest } from "@jest/globals";
import { OrderController } from "../../controllers/orderController.js";
import { OrderService } from "../../services/orderService.js";
import AuditService from "../../services/auditService.js";
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

  it("lista todos os pedidos para admin", async () => {
    jest.spyOn(OrderService.prototype, "getAllOrders").mockResolvedValue([
      {
        id: 1,
        user_id: 1,
      },
    ] as any);

    const req: any = {
      user: {
        id: 99,
      },
    };

    const res = mockResponse();

    await controller.getAllOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      99,
      "ADMIN_ORDER_LIST",
      "Admin listou todos os pedidos"
    );
  });

  it("busca pedido por id para admin", async () => {
    jest.spyOn(OrderService.prototype, "getOrderByIdForAdmin").mockResolvedValue({
      id: 1,
      items: [],
    } as any);

    const req: any = {
      params: {
        id: "1",
      },
      user: {
        id: 99,
      },
    };

    const res = mockResponse();

    await controller.getOrderByIdForAdmin(req, res);

    expect(OrderService.prototype.getOrderByIdForAdmin).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("atualiza status do pedido para admin", async () => {
    jest.spyOn(OrderService.prototype, "updateStatus").mockResolvedValue({
      orderId: 1,
      status: "paid",
      updated: true,
    } as any);

    const req: any = {
      params: {
        id: "1",
      },
      body: {
        status: "paid",
      },
      user: {
        id: 99,
      },
    };

    const res = mockResponse();

    await controller.updateStatus(req, res);

    expect(OrderService.prototype.updateStatus).toHaveBeenCalledWith({
      orderId: 1,
      status: "paid",
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
