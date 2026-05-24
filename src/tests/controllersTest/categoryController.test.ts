import { jest } from "@jest/globals";
import * as categoryController from "../../controllers/categoryController.js";
import CategoryService from "../../services/categoryService.js";
import type { Request, Response } from "express";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("CategoryController", () => {
  let service: CategoryService;

  beforeEach(() => {
    service = new CategoryService();
    jest.clearAllMocks();
  });

  it("lista categorias", async () => {
    jest.spyOn(CategoryService.prototype, "listCategories")
      .mockResolvedValue([{ id: 1, name: "Velas", description: "Religiosas" }] as any);

    const req: any = {};
    const res = mockResponse();

    await categoryController.listCategories(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, name: "Velas", description: "Religiosas" }]);
  });

  it("cria categoria com sucesso", async () => {
    jest.spyOn(CategoryService.prototype, "createCategory").mockResolvedValue();

    const req: any = { body: { name: "Nova Categoria", description: "Teste" } };
    const res = mockResponse();

    await categoryController.addCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Categoria criada com sucesso" });
  });

  it("não cria categoria duplicada", async () => {
    jest.spyOn(CategoryService.prototype, "createCategory")
      .mockRejectedValue(new Error("Categoria já existe"));

    const req: any = { body: { name: "Velas", description: "Duplicada" } };
    const res = mockResponse();

    await categoryController.addCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Categoria já existe" });
  });

  it("retorna erro interno ao criar categoria", async () => {
    jest.spyOn(CategoryService.prototype, "createCategory")
      .mockRejectedValue(new Error("Erro inesperado"));

    const req: any = { body: { name: "Falha", description: "Teste" } };
    const res = mockResponse();

    await categoryController.addCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erro ao criar categoria",
      error: expect.any(Error),
    });
  });

  it("busca categoria por ID inexistente", async () => {
    jest.spyOn(CategoryService.prototype, "getCategory").mockResolvedValue(null);

    const req: any = { params: { id: "99" } };
    const res = mockResponse();

    await categoryController.getCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Categoria não encontrada" });
  });

  it("atualiza categoria", async () => {
    jest.spyOn(CategoryService.prototype, "updateCategory").mockResolvedValue();

    const req: any = { params: { id: "1" }, body: { name: "Atualizada", description: "Nova descrição" } };
    const res = mockResponse();

    await categoryController.updateCategory(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Categoria atualizada com sucesso" });
  });

  it("remove categoria", async () => {
    jest.spyOn(CategoryService.prototype, "deleteCategory").mockResolvedValue();

    const req: any = { params: { id: "1" } };
    const res = mockResponse();

    await categoryController.deleteCategory(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Categoria removida com sucesso" });
  });
});
