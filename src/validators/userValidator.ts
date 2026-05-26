import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome muito curto")
      .max(255, "Nome muito longo")
      .optional(),

    email: z
      .string()
      .trim()
      .email("Email inválido")
      .toLowerCase()
      .optional(),

    phone: z
      .string()
      .trim()
      .regex(/^[0-9\s\-\+\(\)]{10,20}$/, "Telefone inválido")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });