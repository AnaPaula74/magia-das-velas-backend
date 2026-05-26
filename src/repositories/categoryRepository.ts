import { connection } from "../config/database.js";
import type { Category } from "../entities/category.js";
import { NotFoundError } from "../errors/customErrors.js";
import { logger } from "../utils/logger.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

interface CategoryRow extends RowDataPacket, Category {}

export default class CategoryRepository {
  async getAll(): Promise<Category[]> {
    const [rows] = (await connection.query(
      "SELECT * FROM categories ORDER BY created_at DESC"
    )) as [CategoryRow[], unknown];

    logger.info("Categorias listadas");

    return rows;
  }

  async getById(id: number): Promise<Category | null> {
    const [rows] = (await connection.query(
      "SELECT * FROM categories WHERE id = ?",
      [id]
    )) as [CategoryRow[], unknown];

    const category = rows[0] ?? null;

    if (!category) {
      throw new NotFoundError("Categoria não encontrada");
    }

    logger.info(`Categoria consultada: ID ${id}`);

    return category;
  }

  async getByName(name: string): Promise<Category | null> {
    const [rows] = (await connection.query(
      "SELECT * FROM categories WHERE name = ?",
      [name]
    )) as [CategoryRow[], unknown];

    return rows[0] ?? null;
  }

  async create(name: string, description?: string): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description ?? null]
    )) as [ResultSetHeader, unknown];

    logger.info(`Categoria criada: ${name}`);

    return result;
  }

  async update(id: number, data: Partial<Category>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }

    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }

    if (!fields.length) {
      return;
    }

    values.push(id);

    const [result] = (await connection.query(
      `UPDATE categories
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values
    )) as [ResultSetHeader, unknown];

    if (result.affectedRows === 0) {
      throw new NotFoundError("Categoria não encontrada");
    }

    logger.info(`Categoria atualizada: ID ${id}`);
  }

  async delete(id: number): Promise<void> {
    const [result] = (await connection.query(
      "DELETE FROM categories WHERE id = ?",
      [id]
    )) as [ResultSetHeader, unknown];

    if (result.affectedRows === 0) {
      throw new NotFoundError("Categoria não encontrada");
    }

    logger.info(`Categoria removida: ID ${id}`);
  }
}