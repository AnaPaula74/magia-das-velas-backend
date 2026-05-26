import "../setup.js";
import { jest } from "@jest/globals";
import type { NextFunction } from "express";

import { errorMiddleware } from "../../middlewares/errorMiddleware.js";

describe("errorMiddleware", () => {
  const mockResponse = () => {
    const res: any = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 500 e mensagem padrão se não houver status", () => {
    const req: any = {};

    const res = mockResponse();

    const next: NextFunction = jest.fn();

    const err = new Error("Falha inesperada");

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Falha inesperada",
    });
  });

  it("usa status customizado se fornecido", () => {
    const req: any = {};

    const res = mockResponse();

    const next: NextFunction = jest.fn();

    const err: any = {
      statusCode: 404,
      message: "Não encontrado",
    };

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Não encontrado",
    });
  });
});