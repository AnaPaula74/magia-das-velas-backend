import { connection } from "../config/database.js";
import argon2 from "argon2";
import bcrypt from "bcrypt"; // compatibilidade com senhas antigas
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

export class AuthService {
  // registrar novo usuário com senha criptografada
  async register(name: string, email: string, password: string) {
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 2,
    });

    const [result] = await connection.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    logger.info(`Usuário registrado: ${email}`);
    return result;
  }

  // login e geração de tokens
  async login(email: string, password: string) {
    const [rows]: any = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) {
      logger.warn(`Tentativa de login com email não encontrado: ${email}`);
      throw new Error("Usuário não encontrado");
    }

    let passwordMatch = false;
    // tenta Argon2, depois bcrypt
    try {
      passwordMatch = await argon2.verify(user.password, password);
    } catch {
      passwordMatch = await bcrypt.compare(password, user.password);
    }

    if (!passwordMatch) {
      logger.warn(`Senha inválida para usuário: ${email}`);
      throw new Error("Senha inválida");
    }

    const secret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!secret || !refreshSecret) {
      throw new Error("Configuração inválida do servidor");
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "15m", issuer: "magia-das-velas-api", audience: "users" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      refreshSecret,
      { expiresIn: "7d", issuer: "magia-das-velas-api", audience: "users" }
    );

    logger.info(`Login bem-sucedido: ${email}`);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }
}
