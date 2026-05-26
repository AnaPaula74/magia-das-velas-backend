import "../setup.js";
import { jest } from "@jest/globals";
import { CartController } from "../../controllers/cartController.js";
import CartService from "../../services/cartService.js";
import AuditService from "../../services/auditService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;

  return res;
};

describe("CartController", () => {
  let controller: CartController;

  beforeEach(() => {
    controller = new CartController();

    jest.clearAllMocks();

    jest.spyOn(AuditService.prototype, "log").mockResolvedValue(undefined);
  });

  it("adiciona produto no carrinho", async () => {
    const addToCartSpy = jest
      .spyOn(CartService.prototype, "addToCart")
      .mockResolvedValue({
        id: 1,
        productId: 10,
        quantity: 2,
      } as any);

    const req: any = {
      body: {
        productId: 10,
        quantity: 2,
      },
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.add(req, res);

    expect(addToCartSpy).toHaveBeenCalledWith(1, 10, 2);

    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      1,
      "CART_ADD",
      "Produto 10 adicionado ao carrinho"
    );

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Produto adicionado ao carrinho",
      data: {
        id: 1,
        productId: 10,
        quantity: 2,
      },
    });
  });

  it("retorna carrinho", async () => {
    const cartMock = {
      items: [
        {
          id: 1,
          product_id: 10,
          name: "Vela",
          price: 20,
          image_url: "/uploads/vela.jpg",
          quantity: 2,
          subtotal: 40,
        },
      ],
      total: 40,
    };

    const getCartSpy = jest
      .spyOn(CartService.prototype, "getCart")
      .mockResolvedValue(cartMock as any);

    const req: any = {
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.get(req, res);

    expect(getCartSpy).toHaveBeenCalledWith(1);

    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      1,
      "CART_GET",
      "Consultou carrinho"
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Carrinho retornado",
      data: cartMock,
    });
  });

  it("atualiza quantidade de item do carrinho", async () => {
    const updateQuantitySpy = jest
      .spyOn(CartService.prototype, "updateQuantity")
      .mockResolvedValue({
        affectedRows: 1,
      } as any);

    const req: any = {
      params: {
        id: "1",
      },
      body: {
        quantity: 3,
      },
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.update(req, res);

    expect(updateQuantitySpy).toHaveBeenCalledWith(1, 1, 3);

    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      1,
      "CART_UPDATE",
      "Item 1 atualizado no carrinho"
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Quantidade atualizada",
      data: {
        affectedRows: 1,
      },
    });
  });

  it("remove item do carrinho", async () => {
    const removeFromCartSpy = jest
      .spyOn(CartService.prototype, "removeFromCart")
      .mockResolvedValue({
        affectedRows: 1,
      } as any);

    const req: any = {
      params: {
        id: "1",
      },
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.remove(req, res);

    expect(removeFromCartSpy).toHaveBeenCalledWith(1, 1);

    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      1,
      "CART_REMOVE",
      "Item 1 removido do carrinho"
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Item removido do carrinho",
      data: {
        affectedRows: 1,
      },
    });
  });

  it("retorna 401 ao adicionar produto sem usuário autenticado", async () => {
    const addToCartSpy = jest.spyOn(CartService.prototype, "addToCart");

    const req: any = {
      body: {
        productId: 10,
        quantity: 2,
      },
    };

    const res = mockResponse();

    await controller.add(req, res);

    expect(addToCartSpy).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Usuário não autenticado",
    });
  });

  it("retorna 401 ao listar carrinho sem usuário autenticado", async () => {
    const getCartSpy = jest.spyOn(CartService.prototype, "getCart");

    const req: any = {};

    const res = mockResponse();

    await controller.get(req, res);

    expect(getCartSpy).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Usuário não autenticado",
    });
  });

  it("retorna 401 ao atualizar item sem usuário autenticado", async () => {
    const updateQuantitySpy = jest.spyOn(
      CartService.prototype,
      "updateQuantity"
    );

    const req: any = {
      params: {
        id: "1",
      },
      body: {
        quantity: 3,
      },
    };

    const res = mockResponse();

    await controller.update(req, res);

    expect(updateQuantitySpy).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Usuário não autenticado",
    });
  });

  it("retorna 401 ao remover item sem usuário autenticado", async () => {
    const removeFromCartSpy = jest.spyOn(
      CartService.prototype,
      "removeFromCart"
    );

    const req: any = {
      params: {
        id: "1",
      },
    };

    const res = mockResponse();

    await controller.remove(req, res);

    expect(removeFromCartSpy).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Usuário não autenticado",
    });
  });
});