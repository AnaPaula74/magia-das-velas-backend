import { z } from "zod";

// validação para registro
export const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha muito curta"),
});

// validação para login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha muito curta"),
});

// validação para forgot-password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

// validação para reset-password
export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token inválido"),
  newPassword: z.string().min(6, "Senha muito curta"),
});
