import { connection } from "../config/database.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category_id: number | null;
  created_at: Date;
}

export interface UpdateProductRepositoryDTO {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  stock?: number;
  category_id?: number | null;
}

export class ProductRepository {
  async create(
    name: string,
    description: string,
    price: number,
    imageUrl: string,
    stock: number,
    categoryId: number | null
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `INSERT INTO products
        (name, description, price, image_url, stock, category_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, imageUrl, stock, categoryId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async findAll(
    limit: number,
    offset: number,
    search: string,
    order: "ASC" | "DESC"
  ): Promise<ProductRow[]> {
    const [rows] = (await connection.query(
      `SELECT *
       FROM products
       WHERE name LIKE ?
       ORDER BY created_at ${order}
       LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, offset]
    )) as [ProductRow[], unknown];

    return rows;
  }

  async findById(id: number): Promise<ProductRow | null> {
    const [rows] = (await connection.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    )) as [ProductRow[], unknown];

    return rows[0] ?? null;
  }

  async update(
    id: number,
    data: UpdateProductRepositoryDTO
  ): Promise<ResultSetHeader> {
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

    if (data.price !== undefined) {
      fields.push("price = ?");
      values.push(data.price);
    }

    if (data.image_url !== undefined) {
      fields.push("image_url = ?");
      values.push(data.image_url);
    }

    if (data.stock !== undefined) {
      fields.push("stock = ?");
      values.push(data.stock);
    }

    if (data.category_id !== undefined) {
      fields.push("category_id = ?");
      values.push(data.category_id);
    }

    if (!fields.length) {
      throw new Error("Nenhum campo informado para atualização");
    }

    values.push(id);

    const [result] = (await connection.query(
      `UPDATE products
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async findCategoryById(id: number): Promise<{ id: number } | null> {
    const [rows] = (await connection.query(
      "SELECT id FROM categories WHERE id = ?",
      [id]
    )) as [Array<{ id: number }>, unknown];

    return rows[0] ?? null;
  }

  async delete(id: number): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      "DELETE FROM products WHERE id = ?",
      [id]
    )) as [ResultSetHeader, unknown];

    return result;
  }
}