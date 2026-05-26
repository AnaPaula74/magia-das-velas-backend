import nodemailer from "nodemailer";

import { env } from "../config/env.js";
import { logger } from "./logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,

  auth: env.SMTP_USER
    ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      }
    : undefined,
});

export async function sendEmail(
  to: string,
  subject: string,
  text?: string,
  html?: string
) {
  try {
    await transporter.sendMail({
      from: `"Magia das Velas" <${env.SMTP_USER || "no-reply@localhost"}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`Email enviado para ${to}`);
  } catch (error) {
    logger.error("Erro ao enviar email", { error });
    throw error;
  }
}