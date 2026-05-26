import { connection } from "../config/database.js";
import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

export interface OrderCartItemRow extends RowDataPacket {
  product_id: number;
  quantity: number;
  price: number;
}

export interface ProductStockRow extends RowDataPacket {
  stock: number;
}

export interface OrderPaymentRow extends RowDataPacket {
  id: number;
  user_id: number;
  total: number;
  status: string;
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

export default class OrderRepository {
  async getConnection(): Promise<PoolConnection> {
    return await connection.getConnection();
  }

  async getCartItemsForCheckout(
    conn: PoolConnection,
    userId: number
  ): Promise<OrderCartItemRow[]> {
    const [rows] = (await conn.query(
      `SELECT cart_items.product_id, cart_items.quantity, products.price
       FROM cart_items
       JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.user_id = ?`,
      [userId]
    )) as [OrderCartItemRow[], unknown];

    return rows;
  }

  async getProductStockForUpdate(
    conn: PoolConnection,
    productId: number
  ): Promise<ProductStockRow | null> {
    const [rows] = (await conn.query(
      "SELECT stock FROM products WHERE id = ? FOR UPDATE",
      [productId]
    )) as [ProductStockRow[], unknown];

    return rows[0] ?? null;
  }

  async createOrder(
    conn: PoolConnection,
    userId: number,
    total: number,
    status: string
  ): Promise<ResultSetHeader> {
    const [result] = (await conn.query(
      "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)",
      [userId, total, status]
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
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
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
      "UPDATE products SET stock = stock - ? WHERE id = ?",
      [quantity, productId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async clearCart(
    conn: PoolConnection,
    userId: number
  ): Promise<ResultSetHeader> {
    const [result] = (await conn.query(
      "DELETE FROM cart_items WHERE user_id = ?",
      [userId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async getOrdersByUser(userId: number) {
    const [orders] = await connection.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return orders;
  }

  async getOrderByIdForUser(
    orderId: number,
    userId: number
  ): Promise<OrderPaymentRow | null> {
    const [rows] = (await connection.query(
      `SELECT id, user_id, total, status, created_at
       FROM orders
       WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    )) as [OrderPaymentRow[], unknown];

    return rows[0] ?? null;
  }

  async getOrderItems(orderId: number): Promise<OrderItemDetailsRow[]> {
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

  async findByIdForUser(
    orderId: number,
    userId: number
  ): Promise<OrderPaymentRow | null> {
    const [rows] = (await connection.query(
      `SELECT id, user_id, total, status, created_at
       FROM orders
       WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    )) as [OrderPaymentRow[], unknown];

    return rows[0] ?? null;
  }

  async updateStatus(
    orderId: number,
    status: string
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, orderId]
    )) as [ResultSetHeader, unknown];

    return result;
  }
}
