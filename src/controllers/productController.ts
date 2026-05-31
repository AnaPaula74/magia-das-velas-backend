import type { Request, Response } from "express";

import { ProductService } from "../services/productService.js";
import AuditService from "../services/auditService.js";
import type { CreateProductDTO } from "../dtos/product/createProduct.dto.js";
import type { UpdateProductDTO } from "../dtos/product/updateProduct.dto.js";
import type { ProductQueryDTO } from "../dtos/product/productQuery.dto.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

export class ProductController {
  constructor(
    private productService = new ProductService(),
    private auditService = new AuditService()
  ) {}

  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const dto: CreateProductDTO = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim(),
        price: Number(req.body.price),
        image_url: req.file ? `/uploads/${req.file.filename}` : undefined,
        stock: Number(req.body.stock),
        categoryId:
          req.body.categoryId !== undefined ? Number(req.body.categoryId) : undefined,
      };

      if (req.body.physicalPrice !== undefined) {
        dto.physicalPrice = Number(req.body.physicalPrice);
      } else if (req.body.physical_price !== undefined) {
        dto.physicalPrice = Number(req.body.physical_price);
      }

      const result = await this.productService.createProduct(dto);

      await this.auditService.log({
        userId: req.user.id,
        action: "PRODUCT_CREATE",
        details: `Produto criado: ${dto.name} (ID: ${result.id})`,
      });

      logger.info(`Produto criado: ${dto.name} por usuário ${req.user.id}`);

      return success(res, 201, "Produto criado com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao criar produto", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao criar produto")
      );
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const page = Math.max(1, Number(req.query.page ?? 1));
      const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 10)));

      const dto: ProductQueryDTO = {
        page,
        limit,
        search: String(req.query.search ?? "").trim(),
        order: req.query.order === "ASC" ? "ASC" : "DESC",
      };

      if (req.query.categoryId !== undefined) {
        dto.categoryId = Number(req.query.categoryId);
      }

      const products = await this.productService.getProducts(dto);

      logger.info(`Produtos listados com filtros: page=${page}, limit=${limit}`);

      return success(res, 200, "Produtos listados com sucesso", products);
    } catch (error: unknown) {
      logger.error("Erro ao listar produtos", { error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao listar produtos")
      );
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const productId = Number(req.params.id);

      const product = await this.productService.getProductById(productId);

      logger.info(`Produto ${productId} consultado`);

      return success(res, 200, "Produto encontrado", product);
    } catch (error: unknown) {
      logger.error("Erro ao consultar produto", { productId: req.params.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao consultar produto")
      );
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const productId = Number(req.params.id);

      const dto: UpdateProductDTO = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim(),
        price: req.body.price !== undefined ? Number(req.body.price) : undefined,
        physicalPrice:
          req.body.physicalPrice !== undefined
            ? Number(req.body.physicalPrice)
            : req.body.physical_price !== undefined
            ? Number(req.body.physical_price)
            : undefined,
        image_url: req.file ? `/uploads/${req.file.filename}` : undefined,
        stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
        categoryId:
          req.body.categoryId !== undefined ? Number(req.body.categoryId) : undefined,
      };

      const result = await this.productService.updateProduct(productId, dto);

      await this.auditService.log({
        userId: req.user.id,
        action: "PRODUCT_UPDATE",
        details: `Produto ${productId} atualizado`,
      });

      logger.info(`Produto ${productId} atualizado por usuário ${req.user.id}`);

      return success(res, 200, "Produto atualizado com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao atualizar produto", {
        productId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao atualizar produto")
      );
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const productId = Number(req.params.id);

      const result = await this.productService.deleteProduct(productId);

      await this.auditService.log({
        userId: req.user.id,
        action: "PRODUCT_DELETE",
        details: `Produto ${productId} removido`,
      });

      logger.info(`Produto ${productId} removido por usuário ${req.user.id}`);

      return success(res, 200, "Produto deletado com sucesso", result);
    } catch (error: unknown) {
      logger.error("Erro ao deletar produto", {
        productId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao deletar produto")
      );
    }
  }
}

const controller = new ProductController();
export default controller;
