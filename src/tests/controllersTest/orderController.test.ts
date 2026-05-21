import { jest } from "@jest/globals";
import { OrderController } from "../../controllers/orderController.js";
import { OrderService } from "../../services/orderService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("OrderController", () => {
  let controller: OrderController;

  beforeEach(() => {
    controller = new OrderController();
    jest.clearAllMocks();
  });

  it("finaliza pedido", async () => {
    jest.spyOn(OrderService.prototype, "checkout").mockResolvedValue({
      orderId: 1,
      total: 100,
      items: [],
      status: "pending",
    } as any);

    const req: any = { user: { id: 1 } };
    const res = mockResponse();

    await controller.checkout(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Pedido criado", // corrigido
      data: expect.objectContaining({ orderId: 1, total: 100 }),
    });
  });

  it("retorna lista de pedidos", async () => {
    jest.spyOn(OrderService.prototype, "getOrders").mockResolvedValue([
      { orderId: 1, total: 100, status: "pending" },
    ] as any);

    const req: any = { user: { id: 1 } };
    const res = mockResponse();

    await controller.getOrders(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.arrayContaining([expect.objectContaining({ orderId: 1 })]),
    });
  });
});
