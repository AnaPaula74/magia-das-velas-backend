import { connection } from "../config/database.js";
import { logger } from "../utils/logger.js";
import { ValidationError, NotFoundError } from "../errors/customErrors.js";

export default class CartService {
  async addToCart(userId: number, productId: number, quantity: number) {
    if (quantity <= 0) throw new ValidationError("Quantidade deve ser maior que zero");
    const [result] = await connection.query(
      "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [userId, productId, quantity]
    );
    logger.info(`Item adicionado: usuário ${userId}, produto ${productId}, qtd ${quantity}`);
    return result;
  }

  async getCart(userId: number) {
    const [rows] = await connection.query(
      `SELECT cart_items.id, products.name, products.price, products.image_url,
              cart_items.quantity, (products.price * cart_items.quantity) AS subtotal
       FROM cart_items
       JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.user_id = ?`,
      [userId]
    );
    const items = rows as any[];
    if (!items.length) throw new NotFoundError("Carrinho vazio");
    const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    return { items, total };
  }

  async updateQuantity(cartItemId: number, quantity: number) {
    if (quantity <= 0) throw new ValidationError("Quantidade deve ser maior que zero");
    const [result]: any = await connection.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, cartItemId]);
    if (result.affectedRows === 0) throw new NotFoundError("Item não encontrado");
    return result;
  }

  async removeFromCart(cartItemId: number) {
    const [result]: any = await connection.query("DELETE FROM cart_items WHERE id = ?", [cartItemId]);
    if (result.affectedRows === 0) throw new NotFoundError("Item não encontrado");
    return result;
  }
}
