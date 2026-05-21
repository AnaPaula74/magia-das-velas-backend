import { jest } from "@jest/globals";
import { adminMiddleware } from "../../middlewares/adminMiddleware.js";
import type { Request, Response, NextFunction } from "express";

// helper para simular Response
const mockResponse = (): Response => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("adminMiddleware", () => {
  it("retorna 401 se não houver usuário", () => {
    const req: any = {}; // req como any para aceitar user
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Não autenticado" });
  });

  it("retorna 403 se usuário não for admin", () => {
    const req: any = { user: { id: 1, role: "user" } };
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Acesso negado" });
  });

  it("chama next se usuário for admin", () => {
    const req: any = { user: { id: 1, role: "admin" } };
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
