import { jest } from "@jest/globals";
import { CartController } from "../../controllers/cartController.js";
import CartService from "../../services/cartService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("CartController", () => {
  let controller: CartController;

  beforeEach(() => {
    controller = new CartController();
    jest.clearAllMocks();
  });

  it("adiciona produto", async () => {
    jest.spyOn(CartService.prototype, "addToCart").mockResolvedValue({ productId: 1, quantity: 2 } as any);

    const req: any = { body: { productId: 1, quantity: 2 }, user: { id: 1 } };
    const res = mockResponse();

    await controller.add(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Produto adicionado", // corrigido
      data: expect.objectContaining({ productId: 1, quantity: 2 }),
    });
  });

  it("busca carrinho", async () => {
    jest.spyOn(CartService.prototype, "getCart").mockResolvedValue([{ productId: 1, quantity: 2 }] as any);

    const req: any = { user: { id: 1 } };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ productId: 1, quantity: 2 }],
    });
  });
});
