import { connection } from "../config/database.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ReviewRow extends RowDataPacket {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
  name?: string;
}

export interface AverageRow extends RowDataPacket {
  average: number | null;
  totalRatings: number;
}

export default class ReviewRepository {
  async findByUserAndProduct(
    userId: number,
    productId: number
  ): Promise<ReviewRow | null> {
    const [rows] = (await connection.query(
      "SELECT * FROM reviews WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    )) as [ReviewRow[], unknown];

    return rows[0] ?? null;
  }

  async create(
    userId: number,
    productId: number,
    rating: number,
    comment?: string
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)",
      [userId, productId, rating, comment]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async getByProduct(
    productId: number,
    limit?: number,
    offset?: number
  ): Promise<ReviewRow[]> {
    const pagination =
      limit !== undefined && offset !== undefined ? " LIMIT ? OFFSET ?" : "";
    const params =
      limit !== undefined && offset !== undefined
        ? [productId, limit, offset]
        : [productId];

    const [rows] = (await connection.query(
      `SELECT reviews.*, users.name
       FROM reviews
       JOIN users ON users.id = reviews.user_id
       WHERE product_id = ?
       ORDER BY created_at DESC${pagination}`,
      params
    )) as [ReviewRow[], unknown];

    return rows;
  }

  async getAverage(productId: number): Promise<AverageRow | null> {
    const [rows] = (await connection.query(
      "SELECT AVG(rating) as average, COUNT(*) as totalRatings FROM reviews WHERE product_id = ?",
      [productId]
    )) as [AverageRow[], unknown];

    return rows[0] ?? null;
  }

  async findByIdForUser(
    reviewId: number,
    userId: number
  ): Promise<ReviewRow | null> {
    const [rows] = (await connection.query(
      "SELECT * FROM reviews WHERE id = ? AND user_id = ?",
      [reviewId, userId]
    )) as [ReviewRow[], unknown];

    return rows[0] ?? null;
  }

  async update(
    reviewId: number,
    userId: number,
    rating: number,
    comment?: string
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `UPDATE reviews
       SET rating = ?, comment = ?
       WHERE id = ? AND user_id = ?`,
      [rating, comment, reviewId, userId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async delete(reviewId: number, userId: number): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      "DELETE FROM reviews WHERE id = ? AND user_id = ?",
      [reviewId, userId]
    )) as [ResultSetHeader, unknown];

    return result;
  }
}
