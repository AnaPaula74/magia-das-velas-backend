import { z } from "zod";

const dateQuery = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Data inválida")
  .transform((value) => new Date(value));

export const topProductsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int("Limite deve ser um número inteiro")
    .positive("Limite inválido")
    .max(100, "Limite máximo é 100")
    .default(10),
});

export const salesReportQuerySchema = z
  .object({
    startDate: dateQuery.optional(),
    endDate: dateQuery.optional(),
  })
  .refine(
    ({ startDate, endDate }) => !startDate || !endDate || startDate <= endDate,
    {
      message: "Data de início não pode ser posterior à data de término",
      path: ["startDate"],
    }
  );
