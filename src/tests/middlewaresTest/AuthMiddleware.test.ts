import { jest } from "@jest/globals";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// helper para simular Request com token
const mockRequest = (token?: string): any => ({
  headers: { authorization: token ? `Bearer ${token}` : undefined },
});

// helper para simular Response
const mockResponse = (): Response => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authMiddleware", () => {
  it("retorna 401 se token não for fornecido", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Token não fornecido" });
  });

  it("autentica usuário com token válido", () => {
    const token = jwt.sign(
      { id: 1, email: "ana@test.com", role: "user" },
      process.env.JWT_SECRET || "test-secret",
      { issuer: "magia-das-velas-api", audience: "users" }
    );

    const req = mockRequest(token);
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
