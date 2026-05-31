import { connection } from "../config/database.js";
import type { RowDataPacket } from "mysql2";

export interface StatsRow extends RowDataPacket {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
  totalOnlineOrders: number;
  totalPosOrders: number;
  totalOnlineSales: number;
  totalPosSales: number;
  salesCash: number;
  salesCard: number;
  salesPix: number;
  salesMercadopago: number;
}

export interface TopProductRow extends RowDataPacket {
  name: string;
  totalSold: number;
}

export interface SalesReportRow extends RowDataPacket {
  totalOrders: number;
  totalSales: number;
  averageTicket: number;
}

export interface UserMetricsRow extends RowDataPacket {
  totalUsers: number;
  newUsersLast30Days: number;
  usersWithOrders: number;
}

export default class DashboardRepository {
  async getStats(): Promise<StatsRow | null> {
    const [rows] = (await connection.query(
      `SELECT
        (SELECT COUNT(*) FROM products) AS totalProducts,
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM orders) AS totalOrders,
        (SELECT COALESCE(SUM(total), 0) FROM orders) AS totalSales,
        (SELECT COUNT(*) FROM orders WHERE source = 'online') AS totalOnlineOrders,
        (SELECT COUNT(*) FROM orders WHERE source = 'pos') AS totalPosOrders,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE source = 'online') AS totalOnlineSales,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE source = 'pos') AS totalPosSales,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_method = 'cash') AS salesCash,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_method = 'card') AS salesCard,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_method = 'pix') AS salesPix,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_method = 'mercadopago') AS salesMercadopago`
    )) as [StatsRow[], unknown];

    return rows[0] ?? null;
  }

  async topProducts(limit = 5): Promise<TopProductRow[]> {
    const [rows] = (await connection.query(
      `SELECT products.name, COUNT(order_items.product_id) as totalSold
       FROM order_items
       JOIN products ON products.id = order_items.product_id
       GROUP BY order_items.product_id, products.name
       ORDER BY totalSold DESC
       LIMIT ?`,
      [limit]
    )) as [TopProductRow[], unknown];

    return rows;
  }

  async getSalesReport(
    startDate?: Date,
    endDate?: Date
  ): Promise<SalesReportRow | null> {
    const conditions: string[] = [];
    const params: Date[] = [];

    if (startDate) {
      conditions.push("created_at >= ?");
      params.push(startDate);
    }

    if (endDate) {
      conditions.push("created_at <= ?");
      params.push(endDate);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = (await connection.query(
      `SELECT
        COUNT(*) AS totalOrders,
        COALESCE(SUM(total), 0) AS totalSales,
        COALESCE(AVG(total), 0) AS averageTicket
       FROM orders
       ${where}`,
      params
    )) as [SalesReportRow[], unknown];

    return rows[0] ?? null;
  }

  async getUserMetrics(): Promise<UserMetricsRow | null> {
    const [rows] = (await connection.query(
      `SELECT
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS newUsersLast30Days,
        (SELECT COUNT(DISTINCT user_id) FROM orders) AS usersWithOrders`
    )) as [UserMetricsRow[], unknown];

    return rows[0] ?? null;
  }
}
