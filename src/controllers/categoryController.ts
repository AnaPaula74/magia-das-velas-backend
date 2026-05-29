import type { Request, Response } from "express";

import CategoryService from "../services/categoryService.js";
import AuditService from "../services/auditService.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

export class CategoryController {
  constructor(
    private categoryService = new CategoryService(),
    private auditService = new AuditService()
  ) {}

  async list(_req: Request, res: Response) {
    try {
      const categories = await this.categoryService.listCategories();

      logger.info(`Categorias listadas: ${categories.length} categorias`);

      return success(res, 200, "Categorias listadas com sucesso", categories);
    } catch (error: unknown) {
      logger.error("Erro ao listar categorias", { error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao listar categorias")
      );
    }
  }

  async get(req: Request, res: Response) {
    try {
      const categoryId = Number(req.params.id);

      const category = await this.categoryService.getCategory(categoryId);

      logger.info(`Categoria ${categoryId} consultada`);

      return success(res, 200, "Categoria encontrada com sucesso", category);
    } catch (error: unknown) {
      logger.error("Erro ao consultar categoria", { categoryId: req.params.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao consultar categoria")
      );
    }
  }

  async add(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const name = req.body.name?.trim();
      const description = req.body.description?.trim();

      const result = await this.categoryService.createCategory({
        name,
        description,
      });

      await this.auditService.log(
        req.user.id,
        "CATEGORY_CREATE",
        `Categoria criada: ${name}`
      );

      logger.info(`Categoria "${name}" criada por usuário ${req.user.id}`);

      return success(res, 201, "Categoria criada com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao criar categoria", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao criar categoria")
      );
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const categoryId = Number(req.params.id);

      const name = req.body.name?.trim();
      const description = req.body.description?.trim();

      const result = await this.categoryService.updateCategory(categoryId, {
        name,
        description,
      });

      await this.auditService.log(
        req.user.id,
        "CATEGORY_UPDATE",
        `Categoria ${categoryId} atualizada: ${name || "sem alteração de nome"}`
      );

      logger.info(`Categoria ${categoryId} atualizada por usuário ${req.user.id}`);

      return success(res, 200, "Categoria atualizada com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao atualizar categoria", {
        categoryId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao atualizar categoria")
      );
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const categoryId = Number(req.params.id);

      const result = await this.categoryService.deleteCategory(categoryId);

      await this.auditService.log(
        req.user.id,
        "CATEGORY_DELETE",
        `Categoria ${categoryId} removida`
      );

      logger.info(`Categoria ${categoryId} removida por usuário ${req.user.id}`);

      return success(res, 200, "Categoria removida com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao deletar categoria", {
        categoryId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao deletar categoria")
      );
    }
  }
}

const controller = new CategoryController();
export const listCategories = (req: Request, res: Response) =>
  controller.list(req, res);
export const getCategory = (req: Request, res: Response) =>
  controller.get(req, res);
export const addCategory = (req: Request, res: Response) =>
  controller.add(req, res);
export const updateCategory = (req: Request, res: Response) =>
  controller.update(req, res);
export const deleteCategory = (req: Request, res: Response) =>
  controller.delete(req, res);

export default controller;
