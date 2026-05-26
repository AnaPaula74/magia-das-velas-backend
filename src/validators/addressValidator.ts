import { z } from "zod";

export const addressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(5, "Rua deve ter no mínimo 5 caracteres"),

  city: z
    .string()
    .trim()
    .min(3, "Cidade deve ter no mínimo 3 caracteres"),

  state: z
    .string()
    .trim()
    .length(2, "Estado deve ter exatamente 2 caracteres")
    .transform((value) => value.toUpperCase()),

  zip: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
});

export const updateAddressSchema = addressSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });
