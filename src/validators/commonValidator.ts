import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce
    .number()
    .int("ID deve ser um número inteiro")
    .positive("ID inválido"),
});

export const productIdParamSchema = z.object({
  productId: z.coerce
    .number()
    .int("ID do produto deve ser um número inteiro")
    .positive("ID do produto inválido"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Página deve ser um número inteiro")
    .positive("Página inválida")
    .default(1),

  limit: z.coerce
    .number()
    .int("Limite deve ser um número inteiro")
    .positive("Limite inválido")
    .max(100, "Limite máximo é 100")
    .default(10),
});

export const productQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Página deve ser um número inteiro")
    .positive("Página inválida")
    .default(1),

  limit: z.coerce
    .number()
    .int("Limite deve ser um número inteiro")
    .positive("Limite inválido")
    .max(100, "Limite máximo é 100")
    .default(10),

  search: z
    .string()
    .trim()
    .max(100, "Busca muito longa")
    .default(""),

  order: z
    .enum(["ASC", "DESC", "asc", "desc"])
    .default("DESC")
    .transform((value) => value.toUpperCase() as "ASC" | "DESC"),
});