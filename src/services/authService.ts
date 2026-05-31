import crypto from "crypto";
import argon2 from "argon2";
import bcrypt from "bcrypt";

import UserRepository from "../repositories/userRepository.js";
import PasswordResetRepository from "../repositories/passwordResetRepository.js";
import RefreshTokenRepository from "../repositories/refreshTokenRepository.js";
import { NotificationService } from "./notificationService.js";

import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../errors/customErrors.js";

import {
  getRefreshTokenExpiresAt,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";

import { hashToken } from "../utils/tokenHash.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

import type { RegisterDTO } from "../dtos/auth/register.dto.js";
import type { LoginDTO } from "../dtos/auth/login.dto.js";

export default class AuthService {
  constructor(
    private userRepository = new UserRepository(),
    private passwordResetRepository = new PasswordResetRepository(),
    private refreshTokenRepository = new RefreshTokenRepository(),
    private notificationService = new NotificationService()
  ) {}

  private async createSession(user: {
    id: number;
    email: string;
    role: "user" | "admin" | "cashier";
  }) {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await this.refreshTokenRepository.create(
      user.id,
      hashToken(refreshToken),
      getRefreshTokenExpiresAt()
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(data: RegisterDTO) {
    const existingUser = await this.userRepository.findByEmailOptional(
      data.email
    );

    if (existingUser) {
      throw new ConflictError("E-mail já cadastrado");
    }

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
    });

    const createdUser = await this.userRepository.create(
      data.name,
      data.email,
      passwordHash
    );

    const user = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
    };

    const tokens = await this.createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`Usuário registrado: ${user.email}`);

    return {
      user,
      ...tokens,
    };
  }

  async login(data: LoginDTO) {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError("E-mail ou senha inválidos");
    }

    let validPassword = false;

    if (String(user.password).startsWith("$argon2")) {
      validPassword = await argon2.verify(user.password, data.password);
    } else {
      validPassword = await bcrypt.compare(data.password, user.password);
    }

    if (!validPassword) {
      throw new UnauthorizedError("E-mail ou senha inválidos");
    }

    const tokens = await this.createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`Login realizado: ${user.email}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const storedToken = await this.refreshTokenRepository.findValidByHash(
      tokenHash
    );

    if (!storedToken) {
      throw new UnauthorizedError("Refresh token inválido ou revogado");
    }

    const user = await this.userRepository.getById(decoded.id);

    if (!user) {
      throw new UnauthorizedError("Usuário não encontrado");
    }

    await this.refreshTokenRepository.revokeByHash(tokenHash);

    const tokens = await this.createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`Refresh token rotacionado para usuário ${user.id}`);

    return tokens;
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);

    await this.refreshTokenRepository.revokeByHash(tokenHash);

    return {
      message: "Logout realizado com sucesso",
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmailOptional(email);

    const genericMessage =
      "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.";

    if (!user) {
      logger.info("Recuperação de senha solicitada para e-mail não cadastrado");

      return {
        message: genericMessage,
      };
    }

    await this.passwordResetRepository.deleteByUserId(user.id);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await this.passwordResetRepository.create(user.id, tokenHash, expiresAt);

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    const html = `
      <p>Olá, ${user.name}.</p>
      <p>Recebemos uma solicitação para redefinir sua senha.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Este link expira em 30 minutos.</p>
      <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
    `;

    await this.notificationService.sendEmail(
      user.email,
      "Redefinição de senha - Magia das Velas",
      `Acesse o link para redefinir sua senha: ${resetUrl}`,
      html
    );

    logger.info(`Token de reset enviado para usuário ${user.id}`);

    return {
      message: genericMessage,
    };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = hashToken(token);

    const reset = await this.passwordResetRepository.findValidByHash(tokenHash);

    if (!reset) {
      throw new ValidationError("Token inválido ou expirado");
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    await this.userRepository.updatePassword(reset.user_id, passwordHash);
    await this.passwordResetRepository.markAsUsed(reset.id);
    await this.refreshTokenRepository.revokeAllByUserId(reset.user_id);

    logger.info(`Senha redefinida para usuário ${reset.user_id}`);

    return {
      message: "Senha redefinida com sucesso",
    };
  }
}
