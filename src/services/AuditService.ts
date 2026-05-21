import { connection } from "../config/database.js";

// serviço simples para registrar ações críticas
export default class AuditService {
  async log(userId: number, action: string, details: string) {
    await connection.query(
      "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
      [userId, action, details]
    );
  }
}
