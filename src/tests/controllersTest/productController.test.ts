import { jest } from "@jest/globals";
import { ProductController } from "../../controllers/productController.js";
import { ProductService } from "../../services/productService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("ProductController", () => {
  let controller: ProductController;

  beforeEach(() => {
    controller = new ProductController();
    jest.clearAllMocks();
  });

  it("cria produto", async () => {
    jest.spyOn(ProductService.prototype, "createProduct").mockResolvedValue({ id: 1 } as any);

    const req: any = { body: { name: "Produto A", description: "Desc", price: 10, stock: 5 }, user: { id: 1, role: "admin" } };
    const res = mockResponse();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Produto criado", // corrigido
      data: expect.objectContaining({ id: 1 }),
    });
  });

  it("retorna 404 se não encontrado", async () => {
    jest.spyOn(ProductService.prototype, "getProductById").mockResolvedValue(null);

    const req: any = { params: { id: "99" } };
    const res = mockResponse();

    await controller.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Produto não encontrado" });
  });
});
