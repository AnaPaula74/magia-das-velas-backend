// src/services/categoryService.ts

import CategoryRepository from "../repositories/categoryRepository.js";

import type { Category } from "../entities/category.js";

import {
  ConflictError,
  NotFoundError,
} from "../errors/customErrors.js";

import type { CreateCategoryDTO } from "../dtos/category/createCategory.dto.js";
import type { UpdateCategoryDTO } from "../dtos/category/updateCategory.dto.js";

export default class CategoryService {
  constructor(
    private categoryRepository =
      new CategoryRepository()
  ) { }

  async listCategories(): Promise<Category[]> {
    return this.categoryRepository.getAll();
  }

  async getCategory(
    id: number
  ): Promise<Category> {
    const category =
      await this.categoryRepository.getById(id);

    if (!category) {
      throw new NotFoundError(
        "Categoria não encontrada"
      );
    }

    return category;
  }

  async createCategory(
    dto: CreateCategoryDTO
  ): Promise<Category | void> {
    const existing =
      await this.categoryRepository.getByName(
        dto.name
      );

    if (existing) {
      throw new ConflictError(
        "Categoria já existe"
      );
    }

    const result = await this.categoryRepository.create(
      dto.name,
      dto.description
    );

    const category: Category = {
      id: result.insertId,
      name: dto.name,
    };

    if (dto.description !== undefined) {
      category.description = dto.description;
    }

    return category;
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDTO
  ): Promise<Category> {
    const category = await this.getCategory(id);
    const name = dto.name ?? category.name;
    const description =
      dto.description !== undefined ? dto.description : category.description;

    if (name !== category.name) {
      const existing = await this.categoryRepository.getByName(name);

      if (existing && existing.id !== id) {
        throw new ConflictError("Categoria já existe");
      }
    }

    await this.categoryRepository.update(id, {
      name,
      description,
    });

    const updated: Category = {
      ...category,
      name,
    };

    if (description !== undefined) {
      updated.description = description;
    }

    return updated;
  }

  async deleteCategory(id: number) {
    await this.getCategory(id);
    await this.categoryRepository.delete(id);

    return {
      id,
      deleted: true,
    };
  }
}
