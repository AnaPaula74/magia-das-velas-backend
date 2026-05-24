import CategoryRepository from "../repositories/categoryRepository.js";
import type { Category } from "../models/Category.js";

const repo = new CategoryRepository();

export default class CategoryService {
  async listCategories(): Promise<Category[]> {
    return await repo.getAll();
  }

  async getCategory(id: number): Promise<Category | null> {
    return await repo.getById(id);
  }

  async createCategory(name: string, description?: string): Promise<void> {
    const existing = await repo.getByName(name);
    if (existing) {
      throw new Error("Categoria já existe");
    }
    await repo.create(name, description);
  }

  async updateCategory(id: number, name: string, description?: string): Promise<void> {
    await repo.update(id, name, description);
  }

  async deleteCategory(id: number): Promise<void> {
    await repo.delete(id);
  }
}
