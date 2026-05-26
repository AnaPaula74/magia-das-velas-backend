import axios from "axios";

import { logger } from "../utils/logger.js";

import { sendEmail } from "../utils/mailer.js";

import type { SendEmailDTO } from "../dtos/notification/sendEmail.dto.js";

import type { SendWebhookDTO } from "../dtos/notification/sendWebhook.dto.js";

export class NotificationService {
  async sendEmail(dto: SendEmailDTO): Promise<void>;
  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void>;
  async sendEmail(
    input: SendEmailDTO | string,
    subject?: string,
    text?: string,
    html?: string
  ) {
    const dto =
      typeof input === "string"
        ? { to: input, subject: subject ?? "", text: text ?? "", html }
        : input;

    try {
      await sendEmail(
        dto.to,
        dto.subject,
        dto.text,
        dto.html
      );

      logger.info(
        `Notificação enviada para ${dto.to}`
      );
    } catch (error) {
      logger.error(
        "Erro ao enviar notificação por email",
        {
          error,
        }
      );
    }
  }

  async sendWebhook(dto: SendWebhookDTO) {
    try {
      await axios.post(
        dto.url,
        dto.payload
      );

      logger.info(
        `Webhook enviado para ${dto.url}`
      );
    } catch (error) {
      logger.error(
        "Erro ao enviar webhook",
        {
          error,
        }
      );
    }
  }
}
