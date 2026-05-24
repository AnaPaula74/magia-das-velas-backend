import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Nome muito curto")
    .max(255, "Nome muito longo"),
  email: z.string()
    .email("Email inválido"),
  phone: z.string()
    .regex(/^\+?[0-9]{8,15}$/, "Telefone inválido"),
});
