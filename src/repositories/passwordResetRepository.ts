import { connection } from "../config/database.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface PasswordResetRow extends RowDataPacket {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export default class PasswordResetRepository {
  async create(
    userId: number,
    tokenHash: string,
    expiresAt: Date
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `INSERT INTO password_resets
        (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async findValidByHash(
    tokenHash: string
  ): Promise<PasswordResetRow | null> {
    const [rows] = (await connection.query(
      `SELECT *
       FROM password_resets
       WHERE token_hash = ?
         AND used_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    )) as [PasswordResetRow[], unknown];

    return rows[0] ?? null;
  }

  async markAsUsed(id: number): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `UPDATE password_resets
       SET used_at = NOW()
       WHERE id = ?`,
      [id]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async deleteByUserId(userId: number): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `DELETE FROM password_resets
       WHERE user_id = ?`,
      [userId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async deleteExpired(): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `DELETE FROM password_resets
       WHERE expires_at <= NOW()
          OR used_at IS NOT NULL`
    )) as [ResultSetHeader, unknown];

    return result;
  }
}