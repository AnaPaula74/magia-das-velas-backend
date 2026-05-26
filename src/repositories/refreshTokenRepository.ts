import { connection } from "../config/database.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface RefreshTokenRow extends RowDataPacket {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export default class RefreshTokenRepository {
  async create(
    userId: number,
    tokenHash: string,
    expiresAt: Date
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `INSERT INTO refresh_tokens
        (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async findValidByHash(
    tokenHash: string
  ): Promise<RefreshTokenRow | null> {
    const [rows] = (await connection.query(
      `SELECT *
       FROM refresh_tokens
       WHERE token_hash = ?
         AND revoked_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    )) as [RefreshTokenRow[], unknown];

    return rows[0] ?? null;
  }

  async revokeByHash(tokenHash: string): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE token_hash = ?
         AND revoked_at IS NULL`,
      [tokenHash]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async revokeAllByUserId(userId: number): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE user_id = ?
         AND revoked_at IS NULL`,
      [userId]
    )) as [ResultSetHeader, unknown];

    return result;
  }

  async deleteExpired(): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      `DELETE FROM refresh_tokens
       WHERE expires_at <= NOW()
          OR revoked_at IS NOT NULL`
    )) as [ResultSetHeader, unknown];

    return result;
  }
}