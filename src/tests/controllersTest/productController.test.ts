import "../setup.js";
import { jest } from "@jest/globals";
import { ProductController } from "../../controllers/productController.js";
import { ProductService } from "../../services/productService.js";
import AuditService from "../../services/auditService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;

  return res;
};

describe("ProductController", () => {
  let controller: ProductController;

  beforeEach(() => {
    controller = new ProductController();

    jest.clearAllMocks();

    jest.spyOn(AuditService.prototype, "log").mockResolvedValue();
  });

  it("cria produto", async () => {
    jest.spyOn(ProductService.prototype, "createProduct").mockResolvedValue({
      id: 1,
    } as any);

    const req: any = {
      body: {
        name: "Vela",
        description: "Vela aromática",
        price: 20,
        stock: 10,
      },
      file: {
        filename: "vela.jpg",
      },
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("lista produtos", async () => {
    const getProductsSpy = jest.spyOn(ProductService.prototype, "getProducts").mockResolvedValue([
      {
        id: 1,
        name: "Vela",
      },
    ] as any);

    const req: any = {
      query: {
        categoryId: 2,
      },
    };

    const res = mockResponse();

    await controller.getAll(req, res);

    expect(getProductsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 2,
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("retorna produto por id", async () => {
    jest.spyOn(ProductService.prototype, "getProductById").mockResolvedValue({
      id: 1,
      name: "Vela",
    } as any);

    const req: any = {
      params: {
        id: "1",
      },
    };

    const res = mockResponse();

    await controller.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
