import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3000),

  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().default("magia_das_velas"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET não configurado"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET não configurado"),

  FRONTEND_URL: z.string().default("http://localhost:5173"),
  APP_URL: z.string().default("http://localhost:5173"),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  WEBHOOK_ORDERS_URL: z.string().url().optional(),

  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
