import { jest } from "@jest/globals";
import { AuthController } from "../../controllers/authController.js";
import { AuthService } from "../../services/authService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController();
    jest.clearAllMocks();
  });

  it("registra usuário com sucesso", async () => {
    jest.spyOn(AuthService.prototype, "register").mockResolvedValue({ id: 1, email: "ana@test.com" } as any);
    const req: any = { body: { name: "Ana", email: "ana@test.com", password: "123456" } };
    const res = mockResponse();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("falha no login com credenciais inválidas", async () => {
    jest.spyOn(AuthService.prototype, "login").mockRejectedValue(new Error("Credenciais inválidas"));
    const req: any = { body: { email: "ana@test.com", password: "wrong" } };
    const res = mockResponse();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Credenciais inválidas" });
  });

  it("realiza login com sucesso", async () => {
    jest.spyOn(AuthService.prototype, "login").mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
      user: { id: 1, email: "ana@test.com" },
    } as any);
    const req: any = { body: { email: "ana@test.com", password: "123456" } };
    const res = mockResponse();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("inicia fluxo de recuperação de senha", async () => {
    jest.spyOn(AuthService.prototype, "forgotPassword").mockResolvedValue();
    const req: any = { body: { email: "ana@test.com" } };
    const res = mockResponse();

    await controller.forgotPassword(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, message: "E-mail de recuperação enviado" });
  });

  it("falha ao iniciar recuperação de senha para usuário inexistente", async () => {
    jest.spyOn(AuthService.prototype, "forgotPassword").mockRejectedValue(new Error("Usuário não encontrado"));
    const req: any = { body: { email: "naoexiste@test.com" } };
    const res = mockResponse();

    await controller.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Usuário não encontrado" });
  });

  it("redefine senha com token válido", async () => {
    jest.spyOn(AuthService.prototype, "resetPassword").mockResolvedValue();
    const req: any = { body: { token: "validToken", newPassword: "novaSenha123" } };
    const res = mockResponse();

    await controller.resetPassword(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Senha redefinida com sucesso" });
  });

  it("falha ao redefinir senha com token inválido", async () => {
    jest.spyOn(AuthService.prototype, "resetPassword").mockRejectedValue(new Error("Token inválido ou expirado"));
    const req: any = { body: { token: "invalidToken", newPassword: "novaSenha123" } };
    const res = mockResponse();

    await controller.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Token inválido ou expirado" });
  });

  it("refresh token válido gera novo access token", async () => {
    jest.spyOn(AuthService.prototype, "verifyRefreshToken").mockReturnValue({ id: 1 });
    jest.spyOn(AuthService.prototype, "signAccessToken").mockReturnValue("newAccessToken");
    const req: any = { body: { refreshToken: "validToken" } };
    const res = mockResponse();

    await controller.refresh(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Token atualizado",
      data: { accessToken: "newAccessToken" },
    });
  });

  it("falha ao atualizar token com refresh inválido", async () => {
    jest.spyOn(AuthService.prototype, "verifyRefreshToken").mockImplementation(() => { throw new Error("Token inválido"); });
    const req: any = { body: { refreshToken: "invalidToken" } };
    const res = mockResponse();

    await controller.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Token inválido ou expirado" });
  });
});
