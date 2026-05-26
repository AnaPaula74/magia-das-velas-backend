import "../setup.js";
import { jest } from "@jest/globals";
import argon2 from "argon2";

import AuthService from "../../services/authService.js";
import UserRepository from "../../repositories/userRepository.js";
import PasswordResetRepository from "../../repositories/passwordResetRepository.js";
import RefreshTokenRepository from "../../repositories/refreshTokenRepository.js";
import { NotificationService } from "../../services/notificationService.js";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../../errors/customErrors.js";
import { signRefreshToken } from "../../utils/jwtUtils.js";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();

    jest.clearAllMocks();
  });

  it("registra usuário e cria sessão com refresh token persistido", async () => {
    jest
      .spyOn(UserRepository.prototype, "findByEmailOptional")
      .mockResolvedValue(null as any);

    jest
      .spyOn(argon2, "hash")
      .mockResolvedValue("hashed-password" as never);

    jest
      .spyOn(UserRepository.prototype, "create")
      .mockResolvedValue({
        id: 1,
        name: "Ana",
        email: "ana@test.com",
        password: "hashed-password",
        role: "user",
      } as any);

    const createRefreshSpy = jest
      .spyOn(RefreshTokenRepository.prototype, "create")
      .mockResolvedValue({
        insertId: 1,
        affectedRows: 1,
      } as any);

    const result = await service.register({
      name: "Ana",
      email: "ana@test.com",
      password: "12345678",
    });

    expect(result.user).toEqual({
      id: 1,
      name: "Ana",
      email: "ana@test.com",
      role: "user",
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    expect(createRefreshSpy).toHaveBeenCalledTimes(1);

    const firstCall = createRefreshSpy.mock.calls[0]!;

    expect(firstCall[0]).toBe(1);
    expect(typeof firstCall[1]).toBe("string");
    expect(firstCall[2]).toBeInstanceOf(Date);
  });

  it("não registra usuário com e-mail já existente", async () => {
    jest
      .spyOn(UserRepository.prototype, "findByEmailOptional")
      .mockResolvedValue({
        id: 1,
        name: "Ana",
        email: "ana@test.com",
        password: "hash",
        role: "user",
      } as any);

    await expect(
      service.register({
        name: "Ana",
        email: "ana@test.com",
        password: "12345678",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("faz login com senha argon2 válida e cria refresh token persistido", async () => {
    jest
      .spyOn(UserRepository.prototype, "findByEmail")
      .mockResolvedValue({
        id: 1,
        name: "Ana",
        email: "ana@test.com",
        password: "$argon2id$fakehash",
        role: "user",
      } as any);

    jest
      .spyOn(argon2, "verify")
      .mockResolvedValue(true as never);

    const createRefreshSpy = jest
      .spyOn(RefreshTokenRepository.prototype, "create")
      .mockResolvedValue({
        insertId: 1,
        affectedRows: 1,
      } as any);

    const result = await service.login({
      email: "ana@test.com",
      password: "12345678",
    });

    expect(result.user).toEqual({
      id: 1,
      name: "Ana",
      email: "ana@test.com",
      role: "user",
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    expect(createRefreshSpy).toHaveBeenCalledTimes(1);
  });

  it("rejeita login com usuário inexistente", async () => {
    jest
      .spyOn(UserRepository.prototype, "findByEmail")
      .mockResolvedValue(null as any);

    await expect(
      service.login({
        email: "naoexiste@test.com",
        password: "12345678",
      })
    ).rejects.toThrow(UnauthorizedError);
  });

  it("rejeita login com senha inválida", async () => {
    jest
      .spyOn(UserRepository.prototype, "findByEmail")
      .mockResolvedValue({
        id: 1,
        name: "Ana",
        email: "ana@test.com",
        password: "$argon2id$fakehash",
        role: "user",
      } as any);

    jest
      .spyOn(argon2, "verify")
      .mockResolvedValue(false as never);

    await expect(
      service.login({
        email: "ana@test.com",
        password: "senhaerrada",
      })
    ).rejects.toThrow(UnauthorizedError);
  });

  it("refresh rejeita token não persistido", async () => {
    const refreshToken = signRefreshToken({
      id: 1,
      email: "ana@test.com",
      role: "user",
    });

    jest
      .spyOn(RefreshTokenRepository.prototype, "findValidByHash")
      .mockResolvedValue(null);

    await expect(service.refresh(refreshToken)).rejects.toThrow(
      UnauthorizedError
    );
  });

  it("refresh rotaciona token válido", async () => {
    const refreshToken = signRefreshToken({
      id: 1,
      email: "ana@test.com",
      role: "user",
    });

    jest
      .spyOn(RefreshTokenRepository.prototype, "findValidByHash")
      .mockResolvedValue({
        id: 1,
        user_id: 1,
        token_hash: "hash",
        expires_at: new Date(Date.now() + 100000),
        revoked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as any);

    jest
      .spyOn(UserRepository.prototype, "getById")
      .mockResolvedValue({
        id: 1,
        name: "Ana",
        email: "ana@test.com",
        password: "hash",
        role: "user",
      } as any);

    const revokeSpy = jest
      .spyOn(RefreshTokenRepository.prototype, "revokeByHash")
      .mockResolvedValue({
        affectedRows: 1,
      } as any);

    const createSpy = jest
      .spyOn(RefreshTokenRepository.prototype, "create")
      .mockResolvedValue({
        insertId: 2,
        affectedRows: 1,
      } as any);

    const result = await service.refresh(refreshToken);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    expect(revokeSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it("logout revoga refresh token", async () => {
    const revokeSpy = jest
      .spyOn(RefreshTokenRepository.prototype, "revokeByHash")
      .mockResolvedValue({
        affectedRows: 1,
      } as any);

    const result = await service.logout("refresh-token");

    expect(revokeSpy).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      message: "Logout realizado com sucesso",
    });
  });

  it("forgotPassword não revela se e-mail não existe", async () => {
    jest
      .spyOn(UserRepository.prototype, "findByEmailOptional")
      .mockResolvedValue(null as any);

    const sendEmailSpy = jest.spyOn(
      NotificationService.prototype,
      "sendEmail"
    );

    const result = await service.forgotPassword("naoexiste@test.com");

    expect(sendEmailSpy).not.toHaveBeenCalled();

    expect(result).toEqual({
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.",
    });
  });

  it("forgotPassword cria token hash e envia e-mail quando usuário existe", async () => {
    jest
      .spyOn(UserRepository.prototype, "findByEmailOptional")
      .mockResolvedValue({
        id: 1,
        name: "Ana",
        email: "ana@test.com",
        password: "hash",
        role: "user",
      } as any);

    jest
      .spyOn(PasswordResetRepository.prototype, "deleteByUserId")
      .mockResolvedValue({
        affectedRows: 1,
      } as any);

    const createResetSpy = jest
      .spyOn(PasswordResetRepository.prototype, "create")
      .mockResolvedValue({
        insertId: 1,
        affectedRows: 1,
      } as any);

    const sendEmailSpy = jest
      .spyOn(NotificationService.prototype, "sendEmail")
      .mockResolvedValue(undefined);

    const result = await service.forgotPassword("ana@test.com");

    expect(createResetSpy).toHaveBeenCalledTimes(1);

    const createResetFirstCall = createResetSpy.mock.calls[0]!;

    expect(createResetFirstCall[0]).toBe(1);
    expect(typeof createResetFirstCall[1]).toBe("string");
    expect(createResetFirstCall[2]).toBeInstanceOf(Date);

    expect(sendEmailSpy).toHaveBeenCalledTimes(1);

    const sendEmailFirstCall = sendEmailSpy.mock.calls[0]!;

    expect(sendEmailFirstCall[0]).toBe("ana@test.com");
    expect(sendEmailFirstCall[1]).toBe(
      "Redefinição de senha - Magia das Velas"
    );
    expect(sendEmailFirstCall[2]).toContain(
      "/reset-password?token="
    );

    expect(result).toEqual({
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.",
    });
  });

  it("resetPassword rejeita token inválido", async () => {
    jest
      .spyOn(PasswordResetRepository.prototype, "findValidByHash")
      .mockResolvedValue(null);

    await expect(
      service.resetPassword("token-invalido", "12345678")
    ).rejects.toThrow(ValidationError);
  });

  it("resetPassword atualiza senha, marca token usado e revoga refresh tokens", async () => {
    jest
      .spyOn(PasswordResetRepository.prototype, "findValidByHash")
      .mockResolvedValue({
        id: 1,
        user_id: 1,
        token_hash: "hash",
        expires_at: new Date(Date.now() + 100000),
        used_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as any);

    jest
      .spyOn(argon2, "hash")
      .mockResolvedValue("new-password-hash" as never);

    const updatePasswordSpy = jest
      .spyOn(UserRepository.prototype, "updatePassword")
      .mockResolvedValue({
        affectedRows: 1,
      } as any);

    const markAsUsedSpy = jest
      .spyOn(PasswordResetRepository.prototype, "markAsUsed")
      .mockResolvedValue({
        affectedRows: 1,
      } as any);

    const revokeAllSpy = jest
      .spyOn(RefreshTokenRepository.prototype, "revokeAllByUserId")
      .mockResolvedValue({
        affectedRows: 1,
      } as any);

    const result = await service.resetPassword(
      "valid-reset-token",
      "12345678"
    );

    expect(updatePasswordSpy).toHaveBeenCalledWith(
      1,
      "new-password-hash"
    );

    expect(markAsUsedSpy).toHaveBeenCalledWith(1);
    expect(revokeAllSpy).toHaveBeenCalledWith(1);

    expect(result).toEqual({
      message: "Senha redefinida com sucesso",
    });
  });
});