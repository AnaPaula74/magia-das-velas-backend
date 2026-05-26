import { connection } from "../config/database.js";
import { logger } from "../utils/logger.js";
import {
  NotFoundError,
  ConflictError,
} from "../errors/customErrors.js";
import type { User } from "../entities/user.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket, User {}

export default class UserRepository {
  async findByEmail(email: string): Promise<User> {
    const user = await this.findByEmailOptional(email);

    if (!user) {
      logger.warn(`Usuário não encontrado: ${email}`);
      throw new NotFoundError("Usuário não encontrado");
    }

    return user;
  }

  async findByEmailOptional(email: string): Promise<User | null> {
    const [rows] = (await connection.query(
      `SELECT id, name, email, password, role, phone, created_at
       FROM users
       WHERE email = ?`,
      [email]
    )) as [UserRow[], unknown];

    return rows[0] ?? null;
  }

  async getById(id: number): Promise<User | null> {
    const [rows] = (await connection.query(
      `SELECT id, name, email, password, role, phone, created_at
       FROM users
       WHERE id = ?`,
      [id]
    )) as [UserRow[], unknown];

    return rows[0] ?? null;
  }

  async create(
    name: string,
    email: string,
    password: string
  ): Promise<User> {
    const existing = await this.findByEmailOptional(email);

    if (existing) {
      logger.warn(`Tentativa de criar usuário duplicado: ${email}`);
      throw new ConflictError("Email já cadastrado");
    }

    const [result] = (await connection.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    )) as [ResultSetHeader, unknown];

    logger.info(`Usuário criado: ${email}`);

    return {
      id: result.insertId,
      name,
      email,
      password,
      role: "user",
    };
  }

  async updateProfile(
    id: number,
    name: string,
    email: string,
    phone: string
  ): Promise<void> {
    const [result] = (await connection.query(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name, email, phone, id]
    )) as [ResultSetHeader, unknown];

    if (result.affectedRows === 0) {
      throw new NotFoundError("Usuário não encontrado");
    }

    logger.info(`Perfil atualizado: ${id}`);
  }

  async updatePassword(
    id: number,
    hashedPassword: string
  ): Promise<void> {
    const [result] = (await connection.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    )) as [ResultSetHeader, unknown];

    if (result.affectedRows === 0) {
      throw new NotFoundError("Usuário não encontrado");
    }
  }
}