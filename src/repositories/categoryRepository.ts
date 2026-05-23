// src/repositories/categoryRepository.ts
import { connection } from "../config/database.js";
import type { Category } from "../models/Category.js";

export default class CategoryRepository {
  async getAll(): Promise<Category[]> {
    const [rows]: any = await connection.query("SELECT * FROM categories ORDER BY created_at DESC");
    return rows as Category[];
  }

  async getById(id: number): Promise<Category | null> {
    const [rows]: any = await connection.query("SELECT * FROM categories WHERE id = ?", [id]);
    return rows[0] || null;
  }

  async create(name: string, description?: string): Promise<void> {
    await connection.query("INSERT INTO categories (name, description) VALUES (?, ?)", [name, description]);
  }

  async update(id: number, name: string, description?: string): Promise<void> {
    await connection.query("UPDATE categories SET name = ?, description = ? WHERE id = ?", [name, description, id]);
  }

  async delete(id: number): Promise<void> {
    await connection.query("DELETE FROM categories WHERE id = ?", [id]);
  }
}
