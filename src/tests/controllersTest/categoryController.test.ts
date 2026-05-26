import "../setup.js";
import { jest } from "@jest/globals";
import {
  listCategories,
  getCategory,
  addCategory,
} from "../../controllers/categoryController.js";

import CategoryService from "../../services/categoryService.js";
import AuditService from "../../services/auditService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;

  return res;
};

describe("CategoryController", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(AuditService.prototype, "log").mockResolvedValue();
  });

  it("lista categorias", async () => {
    jest.spyOn(CategoryService.prototype, "listCategories").mockResolvedValue([
      {
        id: 1,
        name: "Velas",
      },
    ] as any);

    const req: any = {};
    const res = mockResponse();

    await listCategories(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("retorna categoria por id", async () => {
    jest.spyOn(CategoryService.prototype, "getCategory").mockResolvedValue({
      id: 1,
      name: "Velas",
    } as any);

    const req: any = {
      params: {
        id: "1",
      },
    };

    const res = mockResponse();

    await getCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("cria categoria", async () => {
    jest.spyOn(CategoryService.prototype, "createCategory").mockResolvedValue();

    const req: any = {
      body: {
        name: "Banhos",
        description: "Produtos espirituais",
      },
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await addCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});