import { connection } from "../config/database.js";
import { logger } from "../utils/logger.js";
import { ValidationError } from "../errors/customErrors.js";

export default class DashboardService {
  async getStats() {
    const [products]: any = await connection.query("SELECT COUNT(*) as totalProducts FROM products");
    if (!products.length) throw new ValidationError("Não foi possível calcular estatísticas");
    const [users]: any = await connection.query("SELECT COUNT(*) as totalUsers FROM users");
    const [orders]: any = await connection.query("SELECT COUNT(*) as totalOrders FROM orders");
    const [sales]: any = await connection.query("SELECT COALESCE(SUM(total), 0) as totalSales FROM orders");

    return {
      totalProducts: products[0].totalProducts,
      totalUsers: users[0].totalUsers,
      totalOrders: orders[0].totalOrders,
      totalSales: sales[0].totalSales,
    };
  }

  async topProducts() {
    const [rows]: any = await connection.query(
      `SELECT products.name, COUNT(order_items.product_id) as totalSold
       FROM order_items
       JOIN products ON products.id = order_items.product_id
       GROUP BY order_items.product_id
       ORDER BY totalSold DESC
       LIMIT 5`
    );
    if (!rows.length) throw new ValidationError("Nenhum produto vendido encontrado");
    return rows;
  }
}
