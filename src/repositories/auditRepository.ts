import { connection } from "../config/database.js";
import type { ResultSetHeader } from "mysql2";

export default class AuditRepository {
  async create(
    userId: number | null,
    action: string,
    details: string
  ): Promise<ResultSetHeader> {
    const [result] = (await connection.query(
      "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
      [userId, action, details]
    )) as [ResultSetHeader, unknown];

    return result;
  }
}
