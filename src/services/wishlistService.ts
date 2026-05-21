import { connection } from "../config/database.js";
import { logger } from "../utils/logger.js";
import { ValidationError, NotFoundError } from "../errors/customErrors.js";

export class WishlistService {
  async add(userId: number, productId: number) {
    if (!productId) throw new ValidationError("Produto inválido");
    const [result]: any = await connection.query("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)", [userId, productId]);
    logger.info(`Produto ${productId} adicionado à wishlist do usuário ${userId}`);
    return result;
  }

  async remove(userId: number, productId: number) {
    const [result]: any = await connection.query("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [userId, productId]);
    if (result.affectedRows === 0) throw new NotFoundError("Produto não encontrado na wishlist");
    logger.info(`Produto ${productId} removido da wishlist do usuário ${userId}`);
    return result;
  }

  async list(userId: number) {
    const [rows]: any = await connection.query(
      `SELECT products.* FROM wishlist
       JOIN products ON products.id = wishlist.product_id
       WHERE wishlist.user_id = ?
       ORDER BY wishlist.created_at DESC`,
      [userId]
    );
    if (!rows.length) throw new NotFoundError("Nenhum favorito encontrado");
    logger.info(`Wishlist consultada: usuário ${userId}`);
    return rows;
  }
}
