import { connection } from "../config/database.js";
import argon2 from "argon2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/mailer.js";
import { logger } from "../utils/logger.js";

export class AuthService {
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

  async login(email: string, password: string) {
    const [rows]: any = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) throw new Error("Usuário não encontrado");

    let passwordMatch = false;
    try {
      passwordMatch = await argon2.verify(user.password, password);
    } catch {
      passwordMatch = await bcrypt.compare(password, user.password);
    }

    if (!passwordMatch) throw new Error("Senha inválida");

    const secret = process.env.JWT_SECRET!;
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;

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

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const [rows]: any = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) throw new Error("Usuário não encontrado");

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = await argon2.hash(token, { type: argon2.argon2id });
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

    await connection.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, tokenHash, expiresAt]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail(
      email,
      "Recuperação de senha",
      `Clique aqui para redefinir sua senha: ${resetLink}`,
      `<p>Olá ${user.name},</p>
       <p>Você solicitou a redefinição de senha. Clique no link abaixo para continuar:</p>
       <p><a href="${resetLink}">Redefinir senha</a></p>
       <p>Este link expira em 15 minutos.</p>`
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const [rows]: any = await connection.query("SELECT * FROM password_resets");
    const reset = rows.find((r: any) => argon2.verify(r.token, token));
    if (!reset || new Date(reset.expires_at) < new Date()) throw new Error("Token inválido ou expirado");

    const hashed = await argon2.hash(newPassword, { type: argon2.argon2id });
    await connection.query("UPDATE users SET password = ? WHERE id = ?", [hashed, reset.user_id]);
    await connection.query("DELETE FROM password_resets WHERE user_id = ?", [reset.user_id]);
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  }

  signAccessToken(payload: { id: number }) {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });
  }
}
