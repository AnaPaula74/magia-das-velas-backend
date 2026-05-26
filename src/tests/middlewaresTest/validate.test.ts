import "../setup.js";
import { jest } from "@jest/globals";
import { z } from "zod";
import type { NextFunction } from "express";

import { validate } from "../../middlewares/validate.js";

describe("validate middleware", () => {
  const mockResponse = () => {
    const res: any = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("chama next se validação passar", () => {
    const schema = z.object({
      nome: z.string(),
    });

    const req: any = {
      body: {
        nome: "Produto válido",
      },
    };

    const res = mockResponse();

    const next: NextFunction = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("retorna 400 se validação falhar com ZodError", () => {
    const schema = z.object({
      nome: z.string(),
    });

    const req: any = {
      body: {},
    };

    const res = mockResponse();

    const next: NextFunction = jest.fn();

    validate(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Dados inválidos",
      details: expect.any(Array),
    });
  });

  it("retorna 500 se ocorrer erro inesperado", () => {
    const schema: any = {
      parse: () => {
        throw new Error("Falha interna");
      },
    };

    const req: any = {
      body: {
        nome: "teste",
      },
    };

    const res = mockResponse();

    const next: NextFunction = jest.fn();

    validate(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Erro interno de validação",
    });
  });
});