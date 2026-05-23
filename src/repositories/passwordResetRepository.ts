import { connection } from "../config/database.js";

export default class PasswordResetRepository {
  async create(userId: number, token: string, expiresAt: Date): Promise<void> {
    await connection.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );
  }

  async findByToken(token: string): Promise<any> {
    const [rows]: any = await connection.query("SELECT * FROM password_resets WHERE token = ?", [token]);
    return rows[0] || null;
  }

  async delete(token: string): Promise<void> {
    await connection.query("DELETE FROM password_resets WHERE token = ?", [token]);
  }
}
