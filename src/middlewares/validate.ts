import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { failure } from "../utils/httpResponses.js";

export function validate(schema: ZodSchema, source: "body" | "params" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      (req as unknown as Record<typeof source, unknown>)[source] = parsed;
      logger.info(`Validação de ${source} bem-sucedida`);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn(`Erro de validação em ${source}`, { issues: error.issues });
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: error.issues.map((err) => ({
            field: err.path[0],
            message: err.message,
          })),
        });
      }
      logger.error("Erro interno de validação", { error });
      return failure(res, 500, "Erro interno de validação");
    }
  };
}
