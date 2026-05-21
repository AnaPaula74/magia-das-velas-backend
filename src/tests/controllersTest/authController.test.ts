import { jest } from "@jest/globals";
import { AuthController } from "../../controllers/authController.js";
import { AuthService } from "../../services/authService.js";
import type { Request, Response } from "express";

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

  it("registra usuário", async () => {
    jest.spyOn(AuthService.prototype, "register").mockResolvedValue({ id: 1, email: "ana@test.com" } as any);

    const req: any = { body: { name: "Ana", email: "ana@test.com", password: "123" } };
    const res = mockResponse();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Usuário criado", // corrigido
      data: expect.objectContaining({ id: 1, email: "ana@test.com" }),
    });
  });

  it("falha no login", async () => {
    jest.spyOn(AuthService.prototype, "login").mockRejectedValue(new Error("Credenciais inválidas"));

    const req: any = { body: { email: "ana@test.com", password: "wrong" } };
    const res = mockResponse();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Credenciais inválidas" });
  });

  it("login realizado", async () => {
    jest.spyOn(AuthService.prototype, "login").mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
      user: { id: 1, email: "ana@test.com" },
    } as any);

    const req: any = { body: { email: "ana@test.com", password: "123" } };
    const res = mockResponse();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login realizado", // corrigido
      data: expect.objectContaining({ user: { id: 1, email: "ana@test.com" } }),
    });
  });
});
