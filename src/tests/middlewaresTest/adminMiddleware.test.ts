import "../setup.js";
import { jest } from "@jest/globals";
import type { NextFunction } from "express";

import { adminMiddleware } from "../../middlewares/adminMiddleware.js";
import AuditService from "../../services/auditService.js";

describe("AdminMiddleware", () => {
  const mockResponse = () => {
    const res: any = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
  };

  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest
      .spyOn(AuditService.prototype, "log")
      .mockResolvedValue(undefined);
  });

  it("retorna erro se usuário não autenticado", () => {
    const req: any = {
      user: undefined,
    };

    const res = mockResponse();

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Não autenticado",
    });
  });

  it("retorna erro se usuário não for admin", () => {
    const req: any = {
      user: {
        id: 1,
        role: "user",
      },
    };

    const res = mockResponse();

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Acesso negado",
    });
  });

  it("chama next se usuário for admin", () => {
    const req: any = {
      user: {
        id: 1,
        role: "admin",
      },
    };

    const res = mockResponse();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});