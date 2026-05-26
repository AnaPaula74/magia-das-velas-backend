import { connection } from "../config/database.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface WishlistProductRow extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  created_at: Date;
}

export default class WishlistRepository {
  async findProductById(productId: number): Promise<{ id: number } | null> {
    const [rows] = (await connection.query(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    )) as [Array<{ id: number }>, unknown];

    return rows[0] ?? null;
  }

  async findItem(userId: number, productId: number): Promise<{ user_id: number; product_id: number } | null> {
    const [rows] = (await connection.query(
      "SELECT user_id, product_id FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    )) as [Array<{ user_id: number; product_id: number }>, unknown];

    return rows[0] ?? null;
  }

  async add(userId: number, productId: number): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [userId, productId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async remove(userId: number, productId: number): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async list(userId: number): Promise<WishlistProductRow[]> {
    const [rows] = (await connection.query(
      `SELECT products.*
       FROM wishlist
       JOIN products ON products.id = wishlist.product_id
       WHERE wishlist.user_id = ?
       ORDER BY wishlist.created_at DESC`,
      [userId]
    )) as [WishlistProductRow[], unknown];

    return rows;
  }
}
