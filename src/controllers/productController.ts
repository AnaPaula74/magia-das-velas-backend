import type { Request, Response } from "express";
import { ProductService } from "../services/productService.js";
import { logger } from "../utils/logger.js";
import { ValidationError, NotFoundError } from "../errors/customErrors.js";

const productService = new ProductService();

export class ProductController {
  async create(req: Request, res: Response) {
    try {
      const { name, description, price, stock } = req.body;
      // valida campos obrigatórios
      if (!name || !description || !price || !stock) {
        throw new ValidationError("Campos obrigatórios não preenchidos");
      }

      const image_url = req.file ? `/uploads/${req.file.filename}` : "";
      const result = await productService.createProduct(name, description, Number(price), image_url, Number(stock));

      logger.info(`Produto criado: ${name} por usuário ${req.user?.email}`);
      return res.status(201).json({ success: true, message: "Produto criado", data: result });
    } catch (error: any) {
      logger.error("Erro ao criar produto", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { page = "1", limit = "10", search = "", order = "DESC" } = req.query;
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const offset = (pageNumber - 1) * limitNumber;

      // paginação e busca aplicadas no service
      const products = await productService.getProducts(limitNumber, offset, search as string, order as string);
      logger.info(`Listagem de produtos - página ${pageNumber}`);
      return res.json({ success: true, page: pageNumber, limit: limitNumber, data: products });
    } catch (error: any) {
      logger.error("Erro ao buscar produtos", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const product = await productService.getProductById(id);
      if (!product) throw new NotFoundError("Produto não encontrado");

      logger.info(`Produto consultado: ID ${id}`);
      return res.json({ success: true, data: product });
    } catch (error: any) {
      logger.error("Erro ao buscar produto", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { name, description, price, stock } = req.body;
      // valida campos obrigatórios
      if (!name || !description || !price || !stock) {
        throw new ValidationError("Campos obrigatórios não preenchidos");
      }

      const image_url = req.file ? `/uploads/${req.file.filename}` : "";
      const result = await productService.updateProduct(id, name, description, Number(price), image_url, Number(stock));

      logger.info(`Produto atualizado: ID ${id} por usuário ${req.user?.email}`);
      return res.json({ success: true, message: "Produto atualizado", data: result });
    } catch (error: any) {
      logger.error("Erro ao atualizar produto", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await productService.deleteProduct(id);
      logger.info(`Produto deletado: ID ${id} por usuário ${req.user?.email}`);
      return res.json({ success: true, message: "Produto deletado", data: result });
    } catch (error: any) {
      logger.error("Erro ao deletar produto", { error });
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }
}
