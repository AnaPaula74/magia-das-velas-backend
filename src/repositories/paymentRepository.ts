import { connection } from "../config/database.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface PaymentRow extends RowDataPacket {
  id: number;
  payment_id: string;
  order_id: number;
  method: string;
  amount: number;
  status: string;
  description: string | null;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export default class PaymentRepository {
  async create(
    orderId: number,
    paymentId: string | number,
    method: string,
    amount: number,
    status: string,
    description: string
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `INSERT INTO payments
        (order_id, payment_id, method, amount, status, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, paymentId, method, amount, status, description]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async updateStatus(
    paymentId: string | number,
    status: string
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `UPDATE payments
       SET status = ?
       WHERE payment_id = ?`,
      [status, paymentId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async findByIdForUser(
    id: number | string,
    userId: number
  ): Promise<PaymentRow | null> {
    return this.findByReferenceForUser(id, userId);
  }

  async findByReferenceForUser(
    reference: number | string,
    userId: number
  ): Promise<PaymentRow | null> {
    const numericId = Number(reference);
    const localId = Number.isInteger(numericId) && numericId > 0 ? numericId : -1;

    const [rows] = (await connection.query(
      `SELECT payments.*, orders.user_id
       FROM payments
       JOIN orders ON orders.id = payments.order_id
       WHERE (payments.payment_id = ? OR payments.id = ?)
         AND orders.user_id = ?
       ORDER BY CASE WHEN payments.payment_id = ? THEN 0 ELSE 1 END
       LIMIT 1`,
      [String(reference), localId, userId, String(reference)]
    )) as [PaymentRow[], unknown];

    return rows[0] ?? null;
  }

  async findByPaymentId(paymentId: string | number): Promise<PaymentRow | null> {
    const [rows] = (await connection.query(
      `SELECT payments.*, orders.user_id
       FROM payments
       JOIN orders ON orders.id = payments.order_id
       WHERE payments.payment_id = ?
       LIMIT 1`,
      [String(paymentId)]
    )) as [PaymentRow[], unknown];

    return rows[0] ?? null;
  }

  async updateLocalStatusById(
    id: number,
    status: string
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      "UPDATE payments SET status = ? WHERE id = ?",
      [status, id]
    )) as [ResultSetHeader, unknown];

    return result;
  }
}
