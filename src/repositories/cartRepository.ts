import { connection } from "../config/database.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface CartItemRow extends RowDataPacket {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  subtotal: number;
}

export interface CartProductRow extends RowDataPacket {
  id: number;
  stock: number;
}

export interface CartItemProductRow extends RowDataPacket {
  id: number;
  product_id: number;
  quantity: number;
}

export default class CartRepository {
  async findProductById(productId: number): Promise<CartProductRow | null> {
    const [rows] = (await connection.query(
      "SELECT id, stock FROM products WHERE id = ?",
      [productId]
    )) as [CartProductRow[], unknown];

    return rows[0] ?? null;
  }

  async findItem(
    userId: number,
    productId: number
  ): Promise<{ id: number; quantity: number } | null> {
    const [rows] = (await connection.query(
      `SELECT id, quantity
       FROM cart_items
       WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    )) as [Array<{ id: number; quantity: number }>, unknown];

    return rows[0] ?? null;
  }

  async createItem(
    userId: number,
    productId: number,
    quantity: number
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `INSERT INTO cart_items
        (user_id, product_id, quantity)
       VALUES (?, ?, ?)`,
      [userId, productId, quantity]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async updateItemQuantity(
    userId: number,
    cartItemId: number,
    quantity: number
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `UPDATE cart_items
       SET quantity = ?
       WHERE id = ? AND user_id = ?`,
      [quantity, cartItemId, userId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async findItemByIdForUser(
    userId: number,
    cartItemId: number
  ): Promise<CartItemProductRow | null> {
    const [rows] = (await connection.query(
      `SELECT id, product_id, quantity
       FROM cart_items
       WHERE id = ? AND user_id = ?`,
      [cartItemId, userId]
    )) as [CartItemProductRow[], unknown];

    return rows[0] ?? null;
  }

  async getByUser(userId: number): Promise<CartItemRow[]> {
    const [rows] = (await connection.query(
      `SELECT cart_items.id,
              cart_items.product_id,
              products.name,
              products.price,
              products.image_url,
              cart_items.quantity,
              (products.price * cart_items.quantity) AS subtotal
       FROM cart_items
       JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.user_id = ?
       ORDER BY cart_items.created_at DESC`,
      [userId]
    )) as [CartItemRow[], unknown];

    return rows;
  }

  async deleteItem(
    userId: number,
    cartItemId: number
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `DELETE FROM cart_items
       WHERE id = ? AND user_id = ?`,
      [cartItemId, userId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async clearByUser(userId: number): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      "DELETE FROM cart_items WHERE user_id = ?",
      [userId]
    )) as [ResultSetHeader, unknown];

    return result;
  }
}
