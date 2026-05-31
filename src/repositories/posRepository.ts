import { connection } from "../config/database.js";
import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

export interface PosProductRow extends RowDataPacket {
  id: number;
  name: string;
  image_url: string | null;
  physical_price: number;
  stock: number;
}

export interface PosSaleRow extends RowDataPacket {
  id: number;
  user_id: number;
  sold_by_user_id: number | null;
  sold_by_user_name: string | null;
  total: number;
  status: string;
  source: string;
  payment_method: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  paid_at: Date | null;
  cancelled_at: Date | null;
  created_at: Date;
}

export interface OrderItemDetailsRow extends RowDataPacket {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image_url: string | null;
}

export default class PosRepository {
  async getConnection(): Promise<PoolConnection> {
    return await connection.getConnection();
  }

  async getProductByIdForUpdate(
    conn: PoolConnection,
    productId: number
  ): Promise<PosProductRow | null> {
    const [rows] = (await conn.query(
      `SELECT id, name, image_url, physical_price, stock
       FROM products
       WHERE id = ?
       FOR UPDATE`,
      [productId]
    )) as [PosProductRow[], unknown];

    return rows[0] ?? null;
  }

  async createOrder(
    conn: PoolConnection,
    userId: number,
    total: number,
    status: string,
    source: string,
    paymentMethod: string,
    soldByUserId: number,
    customerName: string | null,
    customerPhone: string | null,
    paidAt: Date
  ): Promise<ResultSetHeader> {
    const [result] = (await conn.query(
      `INSERT INTO orders
        (user_id, address_id, total, status, source, payment_method, sold_by_user_id, customer_name, customer_phone, paid_at)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        total,
        status,
        source,
        paymentMethod,
        soldByUserId,
        customerName,
        customerPhone,
        paidAt,
      ]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async createOrderItem(
    conn: PoolConnection,
    orderId: number,
    productId: number,
    quantity: number,
    price: number
  ): Promise<ResultSetHeader> {
    const [result] = (await conn.query(
      `INSERT INTO order_items
        (order_id, product_id, quantity, price)
       VALUES (?, ?, ?, ?)`,
      [orderId, productId, quantity, price]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async decreaseStock(
    conn: PoolConnection,
    productId: number,
    quantity: number
  ): Promise<ResultSetHeader> {
    const [result] = (await conn.query(
      `UPDATE products
       SET stock = stock - ?
       WHERE id = ?`,
      [quantity, productId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async increaseStock(
    conn: PoolConnection,
    productId: number,
    quantity: number
  ): Promise<ResultSetHeader> {
    const [result] = (await conn.query(
      `UPDATE products
       SET stock = stock + ?
       WHERE id = ?`,
      [quantity, productId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async getSales(
    soldByUserId?: number,
    paymentMethod?: string,
    status?: string
  ): Promise<PosSaleRow[]> {
    const conditions: string[] = ["orders.source = 'pos'"];
    const params: unknown[] = [];

    if (soldByUserId !== undefined) {
      conditions.push("orders.sold_by_user_id = ?");
      params.push(soldByUserId);
    }

    if (paymentMethod) {
      conditions.push("orders.payment_method = ?");
      params.push(paymentMethod);
    }

    if (status) {
      conditions.push("orders.status = ?");
      params.push(status);
    }

    const [rows] = (await connection.query(
      `SELECT orders.id,
              orders.user_id,
              orders.sold_by_user_id,
              users.name AS sold_by_user_name,
              orders.total,
              orders.status,
              orders.source,
              orders.payment_method,
              orders.customer_name,
              orders.customer_phone,
              orders.paid_at,
              orders.cancelled_at,
              orders.created_at
       FROM orders
       LEFT JOIN users ON users.id = orders.sold_by_user_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY orders.created_at DESC`,
      params
    )) as [PosSaleRow[], unknown];

    return rows;
  }

  async getSaleById(orderId: number): Promise<PosSaleRow | null> {
    const [rows] = (await connection.query(
      `SELECT orders.id,
              orders.user_id,
              orders.sold_by_user_id,
              users.name AS sold_by_user_name,
              orders.total,
              orders.status,
              orders.source,
              orders.payment_method,
              orders.customer_name,
              orders.customer_phone,
              orders.paid_at,
              orders.cancelled_at,
              orders.created_at
       FROM orders
       LEFT JOIN users ON users.id = orders.sold_by_user_id
       WHERE orders.id = ?
         AND orders.source = 'pos'
       LIMIT 1`,
      [orderId]
    )) as [PosSaleRow[], unknown];

    return rows[0] ?? null;
  }

  async getSaleItems(orderId: number): Promise<OrderItemDetailsRow[]> {
    const [rows] = (await connection.query(
      `SELECT order_items.id,
              order_items.order_id,
              order_items.product_id,
              order_items.quantity,
              order_items.price,
              products.name,
              products.image_url
       FROM order_items
       JOIN products ON products.id = order_items.product_id
       WHERE order_items.order_id = ?`,
      [orderId]
    )) as [OrderItemDetailsRow[], unknown];

    return rows;
  }

  async cancelSale(
    conn: PoolConnection,
    orderId: number
  ): Promise<ResultSetHeader> {
    const [result] = (await conn.query(
      `UPDATE orders
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE id = ?
         AND source = 'pos'`,
      [orderId]
    )) as [ResultSetHeader, unknown];

    return result;
  }
}
