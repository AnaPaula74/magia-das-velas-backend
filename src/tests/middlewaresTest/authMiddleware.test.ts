import "../setup.js";
import { jest } from "@jest/globals";
import type { Request, Response } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { signAccessToken } from "../../utils/jwtUtils.js";

describe("authMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it("retorna 401 quando token não é fornecido", () => {
    authMiddleware(req as Request, res as Response, next as any);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Token não fornecido",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 401 quando token é inválido", () => {
    req.headers = {
      authorization: "Bearer token-invalido",
    };

    authMiddleware(req as Request, res as Response, next as any);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Token inválido ou expirado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 401 quando header Authorization não usa Bearer", () => {
    const token = signAccessToken({
      id: 1,
      email: "admin@test.com",
      role: "admin",
    });

    req.headers = {
      authorization: token,
    };

    authMiddleware(req as Request, res as Response, next as any);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Token inválido",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("autentica usuário com token válido", () => {
    const token = signAccessToken({
      id: 1,
      email: "admin@test.com",
      role: "admin",
    });

    req.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(req as Request, res as Response, next as any);

    expect(req.user).toEqual(
      expect.objectContaining({
        id: 1,
        email: "admin@test.com",
        role: "admin",
        type: "access",
      })
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});