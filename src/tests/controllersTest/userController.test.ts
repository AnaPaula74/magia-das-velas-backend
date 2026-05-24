import { jest } from "@jest/globals";
import * as userController from "../../controllers/userController.js";
import UserService from "../../services/userService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("UserController - updateProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("atualiza perfil com sucesso", async () => {
    jest.spyOn(UserService.prototype, "updateProfile").mockResolvedValue();

    const req: any = {
      user: { id: 1 }, 
      body: { name: "Ana", email: "ana@email.com", phone: "+5522999999999" },
    };
    const res = mockResponse();

    await userController.updateProfile(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Perfil atualizado com sucesso" });
  });

  it("retorna 404 se usuário não existe", async () => {
    jest.spyOn(UserService.prototype, "updateProfile")
      .mockRejectedValue(new Error("Usuário não encontrado"));

    const req: any = {
      user: { id: 99 },
      body: { name: "Ana", email: "ana@email.com", phone: "+5522999999999" },
    };
    const res = mockResponse();

    await userController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuário não encontrado" });
  });

  it("retorna 500 em erro inesperado", async () => {
    jest.spyOn(UserService.prototype, "updateProfile")
      .mockRejectedValue(new Error("Erro inesperado"));

    const req: any = {
      user: { id: 1 },
      body: { name: "Ana", email: "ana@email.com", phone: "+5522999999999" },
    };
    const res = mockResponse();

    await userController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erro ao atualizar perfil",
      error: expect.any(Error),
    });
  });

  it("retorna 401 se não autenticado", async () => {
    const req: any = {
      body: { name: "Ana", email: "ana@email.com", phone: "+5522999999999" },
    };
    const res = mockResponse();

    await userController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Não autenticado" });
  });
});
