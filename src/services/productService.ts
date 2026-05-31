import { logger } from "../utils/logger.js";
import { NotFoundError, ValidationError } from "../errors/customErrors.js";
import { ProductRepository } from "../repositories/productRepository.js";

import type { CreateProductDTO } from "../dtos/product/createProduct.dto.js";
import type { UpdateProductDTO } from "../dtos/product/updateProduct.dto.js";
import type { ProductQueryDTO } from "../dtos/product/productQuery.dto.js";

export class ProductService {
  constructor(private productRepository = new ProductRepository()) {}

  async createProduct(dto: CreateProductDTO) {
    if (dto.price <= 0) {
      throw new ValidationError("Preço deve ser maior que zero");
    }

    if (dto.stock < 0) {
      throw new ValidationError("Estoque não pode ser negativo");
    }

    await this.ensureCategoryExists(dto.categoryId);

    const result = await this.productRepository.create(
      dto.name,
      dto.description,
      dto.price,
      dto.physicalPrice ?? dto.price,
      dto.image_url ?? "",
      dto.stock,
      dto.categoryId ?? null
    );

    logger.info(`Produto criado: ${dto.name}`);

    return {
      id: result.insertId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      physical_price: dto.physicalPrice ?? dto.price,
      image_url: dto.image_url ?? "",
      stock: dto.stock,
      categoryId: dto.categoryId ?? null,
    };
  }

  async getProducts(dto: ProductQueryDTO) {
    const limit = dto.limit ?? 10;
    const page = dto.page ?? 1;
    const offset = (page - 1) * limit;
    const search = dto.search ?? "";
    const order = dto.order === "ASC" ? "ASC" : "DESC";

    if (dto.categoryId !== undefined) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const products = await this.productRepository.findAll(
      limit,
      offset,
      search,
      order,
      dto.categoryId
    );

    logger.info(
      `Produtos listados: busca="${search}", categoria=${dto.categoryId ?? "todas"}, ordem=${order}, limite=${limit}, offset=${offset}`
    );

    return products;
  }

  async getProductById(id: number) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      logger.warn(`Produto não encontrado: ID ${id}`);
      throw new NotFoundError("Produto não encontrado");
    }

    logger.info(`Produto consultado: ID ${id}`);

    return product;
  }

  async updateProduct(id: number, dto: UpdateProductDTO) {
    const current = await this.getProductById(id);

    const categoryId =
      dto.categoryId !== undefined ? dto.categoryId : current.category_id ?? null;

    await this.ensureCategoryExists(categoryId);

    const next = {
      name: dto.name ?? current.name,
      description: dto.description ?? current.description,
      price: dto.price ?? Number(current.price),
      physical_price:
        dto.physicalPrice !== undefined
          ? dto.physicalPrice
          : Number(current.physical_price),
      image_url: dto.image_url ?? current.image_url ?? "",
      stock: dto.stock ?? current.stock,
      category_id: categoryId,
    };

    if (next.price <= 0) {
      throw new ValidationError("Preço deve ser maior que zero");
    }

    if (next.physical_price <= 0) {
      throw new ValidationError("Preço da loja física deve ser maior que zero");
    }

    if (next.stock < 0) {
      throw new ValidationError("Estoque não pode ser negativo");
    }

    const result = await this.productRepository.update(id, next);

    if (result.affectedRows === 0) {
      throw new NotFoundError("Produto não encontrado");
    }

    logger.info(`Produto atualizado: ID ${id}`);

    return {
      ...current,
      ...next,
    };
  }

  async deleteProduct(id: number) {
    const result = await this.productRepository.delete(id);

    if (result.affectedRows === 0) {
      throw new NotFoundError("Produto não encontrado");
    }

    logger.info(`Produto deletado: ID ${id}`);

    return {
      id,
      deleted: true,
    };
  }

  private async ensureCategoryExists(categoryId?: number | null) {
    if (categoryId === undefined || categoryId === null) {
      return;
    }

    if (categoryId <= 0) {
      throw new ValidationError("Categoria inválida");
    }

    const category = await this.productRepository.findCategoryById(categoryId);

    if (!category) {
      throw new NotFoundError("Categoria não encontrada");
    }
  }
}