import { jest } from "@jest/globals";
import { WishlistController } from "../../controllers/wishlistController.js";
import { WishlistService } from "../../services/wishlistService.js";
import type { Response } from "express";

// helper para simular objeto Response
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res) as Response["status"];
  res.json = jest.fn().mockReturnValue(res) as Response["json"];
  return res as Response;
};

describe("WishlistController", () => {
  let controller: WishlistController;

  beforeEach(() => {
    controller = new WishlistController();
    jest.clearAllMocks();
  });

  it("adiciona produto à wishlist", async () => {
    jest.spyOn(WishlistService.prototype, "add").mockResolvedValue({ productId: 1 } as any);

    const req: any = { user: { id: 1 }, body: { productId: 1 } }; // req como any para aceitar user
    const res = mockResponse();

    await controller.add(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Adicionado aos favoritos", // mensagem padronizada
      data: expect.objectContaining({ productId: 1 }),
    });
  });

  it("remove produto da wishlist", async () => {
    jest.spyOn(WishlistService.prototype, "remove").mockResolvedValue({ productId: 1 } as any);

    const req: any = { user: { id: 1 }, params: { productId: "1" } }; // req como any para aceitar params
    const res = mockResponse();

    await controller.remove(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Removido dos favoritos", // mensagem padronizada
      data: expect.objectContaining({ productId: 1 }),
    });
  });

  it("lista wishlist do usuário", async () => {
    jest.spyOn(WishlistService.prototype, "list").mockResolvedValue([{ productId: 1 }] as any);

    const req: any = { user: { id: 1 } }; // req como any para aceitar user
    const res = mockResponse();

    await controller.list(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ productId: 1 }],
    });
  });
});
