import "../setup.js";
import { jest } from "@jest/globals";
import { AuthController } from "../../controllers/authController.js";
import AuthService from "../../services/authService.js";
import AuditService from "../../services/auditService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;

  return res;
};

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController();

    jest.clearAllMocks();

    jest.spyOn(AuditService.prototype, "log").mockResolvedValue(undefined);
  });

  it("registra usuário", async () => {
    jest.spyOn(AuthService.prototype, "register").mockResolvedValue({
      user: {
        id: 1,
        name: "Ana",
        email: "ana@test.com",
        role: "user",
      },
      accessToken: "access-token",
      refreshToken: "refresh-token",
    } as any);

    const req: any = {
      body: {
        name: "Ana",
        email: "ana@test.com",
        password: "12345678",
      },
    };

    const res = mockResponse();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("realiza login", async () => {
    jest.spyOn(AuthService.prototype, "login").mockResolvedValue({
      user: {
        id: 1,
        name: "Ana",
        email: "ana@test.com",
        role: "user",
      },
      accessToken: "access-token",
      refreshToken: "refresh-token",
    } as any);

    const req: any = {
      body: {
        email: "ana@test.com",
        password: "12345678",
      },
    };

    const res = mockResponse();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("rotaciona refresh token", async () => {
    const refreshSpy = jest
      .spyOn(AuthService.prototype, "refresh")
      .mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      } as any);

    const req: any = {
      body: {
        refreshToken: "old-refresh-token",
      },
    };

    const res = mockResponse();

    await controller.refresh(req, res);

    expect(refreshSpy).toHaveBeenCalledWith("old-refresh-token");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("faz logout revogando refresh token", async () => {
    const logoutSpy = jest
      .spyOn(AuthService.prototype, "logout")
      .mockResolvedValue({
        message: "Logout realizado com sucesso",
      } as any);

    const req: any = {
      body: {
        refreshToken: "refresh-token",
      },
    };

    const res = mockResponse();

    await controller.logout(req, res);

    expect(logoutSpy).toHaveBeenCalledWith("refresh-token");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("forgot password retorna mensagem genérica", async () => {
    jest.spyOn(AuthService.prototype, "forgotPassword").mockResolvedValue({
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.",
    } as any);

    const req: any = {
      body: {
        email: "ana@test.com",
      },
    };

    const res = mockResponse();

    await controller.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("redefine senha", async () => {
    const resetSpy = jest
      .spyOn(AuthService.prototype, "resetPassword")
      .mockResolvedValue({
        message: "Senha redefinida com sucesso",
      } as any);

    const req: any = {
      body: {
        token: "reset-token",
        password: "12345678",
      },
    };

    const res = mockResponse();

    await controller.resetPassword(req, res);

    expect(resetSpy).toHaveBeenCalledWith("reset-token", "12345678");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});