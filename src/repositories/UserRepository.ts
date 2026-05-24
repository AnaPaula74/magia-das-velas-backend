import { connection } from "../config/database.js";
import { logger } from "../utils/logger.js";
import { NotFoundError, ConflictError } from "../errors/customErrors.js";
import type { User } from "../models/User.js";

export default class UserRepository {
  async findByEmail(email: string): Promise<User> {
    const [rows]: any = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) {
      logger.warn(`Usuário não encontrado: ${email}`);
      throw new NotFoundError("Usuário não encontrado");
    }
    return user as User;
  }

  async getById(id: number): Promise<User | null> {
    const [rows]: any = await connection.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  }

  async create(name: string, email: string, password: string): Promise<User> {
    const [existing]: any = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      logger.warn(`Tentativa de criar usuário duplicado: ${email}`);
      throw new ConflictError("Email já cadastrado");
    }

    const [result]: any = await connection.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    logger.info(`Usuário criado: ${email}`);

    return {
      id: result.insertId,
      name,
      email,
      password,
    } as User;
  }

  async updateProfile(id: number, name: string, email: string, phone: string): Promise<void> {
    const [rows]: any = await connection.query("SELECT id FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
      throw new NotFoundError("Usuário não encontrado");
    }

    await connection.query(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name, email, phone, id]
    );
    logger.info(`Perfil atualizado: ${id}`);
  }
}
