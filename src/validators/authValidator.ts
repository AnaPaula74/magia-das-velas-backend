import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um símbolo");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres"),

  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .toLowerCase(),

  password: strongPassword,
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Senha obrigatória"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token obrigatório"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, "Token obrigatório"),

  password: strongPassword,
});
