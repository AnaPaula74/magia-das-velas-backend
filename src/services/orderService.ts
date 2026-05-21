import { connection } from "../config/database.js";
import { logger } from "../utils/logger.js";

// serviço de pedidos
export class OrderService {
  async checkout(userId: number) {
    const [cartItems] = await connection.query(
      `SELECT cart_items.product_id, cart_items.quantity, products.price
       FROM cart_items
       JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.user_id = ?`,
      [userId]
    );

    const items = cartItems as { product_id: number; quantity: number; price: number }[];
    // valida se carrinho está vazio
    if (items.length === 0) {
      logger.warn(`Checkout com carrinho vazio: usuário ${userId}`);
      throw new Error("Carrinho vazio");
    }

    // valida estoque de cada item
    for (const item of items) {
      const [productRows]: any = await connection.query("SELECT stock FROM products WHERE id = ?", [item.product_id]);
      const product = productRows[0];
      if (!product || product.stock < item.quantity) {
        logger.warn(`Estoque insuficiente: produto ${item.product_id}, solicitado ${item.quantity}`);
        throw new Error(`Estoque insuficiente para produto ID ${item.product_id}`);
      }
    }

    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    // cria pedido
    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)",
      [userId, total, "pending"]
    );
    const orderId = (orderResult as any).insertId;

    // insere itens do pedido
    for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // atualiza estoque
    for (const item of items) {
      await connection.query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.product_id]);
    }

    // limpa carrinho do usuário
    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);

    logger.info(`Pedido criado: usuário ${userId}, pedido ${orderId}, total ${total}`);
    return { orderId, total, items, status: "pending" };
  }

  async getOrders(userId: number) {
    const [orders] = await connection.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    logger.info(`Pedidos consultados: usuário ${userId}`);
    return orders;
  }

  async updateStatus(orderId: number, status: string) {
    const [result] = await connection.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
    logger.info(`Status do pedido atualizado: ID ${orderId}, novo status=${status}`);
    return result;
  }
}
