import { jest } from "@jest/globals";
import * as categoryController from "../../controllers/categoryController.js";
import CategoryRepository from "../../repositories/categoryRepository.js";
import type { Request, Response } from "express";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("CategoryController", () => {
  let repo: CategoryRepository;

  beforeEach(() => {
    repo = new CategoryRepository();
    jest.clearAllMocks();
  });

  it("lista categorias", async () => {
    jest.spyOn(CategoryRepository.prototype, "getAll")
      .mockResolvedValue([{ id: 1, name: "Velas", description: "Religiosas" }] as any);

    const req: any = {};
    const res = mockResponse();

    await categoryController.listCategories(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, name: "Velas", description: "Religiosas" }]);
  });

  it("cria categoria", async () => {
    jest.spyOn(CategoryRepository.prototype, "create").mockResolvedValue();

    const req: any = { body: { name: "Nova Categoria", description: "Teste" } };
    const res = mockResponse();

    await categoryController.addCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Categoria criada com sucesso" });
  });
});
