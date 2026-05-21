import { connection } from "../config/database.js";
import { logger } from "../utils/logger.js";
import { ValidationError, NotFoundError } from "../errors/customErrors.js";

export class ReviewService {
  async create(userId: number, productId: number, rating: number, comment: string) {
    // valida nota
    if (rating < 1 || rating > 5) throw new ValidationError("Nota deve estar entre 1 e 5");
    const [result]: any = await connection.query(
      "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)",
      [userId, productId, rating, comment]
    );
    logger.info(`Review criada: produto ${productId}, usuário ${userId}, nota ${rating}`);
    return result;
  }

  async getByProduct(productId: number) {
    const [rows]: any = await connection.query(
      `SELECT reviews.*, users.name
       FROM reviews
       JOIN users ON users.id = reviews.user_id
       WHERE product_id = ?
       ORDER BY created_at DESC`,
      [productId]
    );
    if (!rows.length) throw new NotFoundError("Nenhuma review encontrada para este produto");
    logger.info(`Reviews listadas para produto ${productId}`);
    return rows;
  }

  async getAverage(productId: number) {
    const [rows]: any = await connection.query("SELECT AVG(rating) as average FROM reviews WHERE product_id = ?", [productId]);
    if (!rows.length || rows[0].average === null) {
      throw new NotFoundError("Nenhuma avaliação encontrada");
    }
    logger.info(`Média calculada para produto ${productId}`);
    return rows[0];
  }
}
