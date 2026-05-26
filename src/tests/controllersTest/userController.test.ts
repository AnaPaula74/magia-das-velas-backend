import "../setup.js";
import { jest } from "@jest/globals";
import { updateProfile } from "../../controllers/userController.js";
import UserService from "../../services/userService.js";
import AuditService from "../../services/auditService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;

  return res;
};

describe("UserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(AuditService.prototype, "log").mockResolvedValue();
  });

  it("atualiza perfil", async () => {
    jest.spyOn(UserService.prototype, "updateProfile").mockResolvedValue();

    const req: any = {
      body: {
        name: "Ana",
        email: "ana@test.com",
        phone: "22999999999",
      },
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("retorna erro sem usuário autenticado", async () => {
    const req: any = {
      body: {},
    };

    const res = mockResponse();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});