import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { logger } from "../utils/logger.js";
import { connection } from "../config/database.js";

interface PixPaymentDTO {
  amount: number;
  description: string;
  email: string;
}

interface MercadoPagoDTO {
  amount: number;
  description: string;
}

export class PaymentService {
  private payment: Payment;
  private preference: Preference;

  constructor() {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado");
    }

    const client = new MercadoPagoConfig({
      accessToken,
    });

    this.payment = new Payment(client);
    this.preference = new Preference(client);
  }

  /**
   * Criar pagamento Pix
   */
  async generatePixMercadoPago(data: PixPaymentDTO) {
    try {
      const result = await this.payment.create({
        body: {
          transaction_amount: data.amount,
          description: data.description,
          payment_method_id: "pix",
          payer: {
            email: data.email,
          },
        },
      });

      await connection.query(
        `
        INSERT INTO payments (
          payment_id,
          method,
          amount,
          status,
          description
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          result.id,
          "pix",
          data.amount,
          "pending",
          data.description,
        ]
      );

      logger.info("Pagamento Pix criado", {
        paymentId: result.id,
      });

      return result.point_of_interaction?.transaction_data;
    } catch (error: any) {
      logger.error("Erro ao gerar Pix Mercado Pago", {
        error: error.message,
      });

      throw new Error("Falha ao criar pagamento Pix");
    }
  }

  /**
   * Criar checkout Mercado Pago
   */
  async generateMercadoPago(data: MercadoPagoDTO) {
    try {
      const result = await this.preference.create({
        body: {
          items: [
            {
              id: crypto.randomUUID(),
              title: data.description,
              quantity: 1,
              currency_id: "BRL",
              unit_price: data.amount,
            },
          ],

          back_urls: {
            success: `${process.env.APP_URL}/payment/success`,
            failure: `${process.env.APP_URL}/payment/failure`,
            pending: `${process.env.APP_URL}/payment/pending`,
          },

          auto_return: "approved",
        },
      });

      await connection.query(
        `
        INSERT INTO payments (
          payment_id,
          method,
          amount,
          status,
          description
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          result.id,
          "mercadopago",
          data.amount,
          "pending",
          data.description,
        ]
      );

      logger.info("Checkout Mercado Pago criado", {
        paymentId: result.id,
      });

      return {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
      };
    } catch (error: any) {
      logger.error("Erro ao criar checkout Mercado Pago", {
        error: error.message,
      });

      throw new Error("Falha ao criar checkout Mercado Pago");
    }
  }

  /**
   * Processar webhook Mercado Pago
   */
  async processWebhook(payload: any) {
    try {
      logger.info("Webhook Mercado Pago recebido", {
        payload,
      });

      if (payload.type !== "payment") {
        return;
      }

      const paymentId = payload.data.id;

      const payment = await this.payment.get({
        id: paymentId,
      });

      await connection.query(
        `
        UPDATE payments
        SET status = ?
        WHERE payment_id = ?
        `,
        [
          payment.status,
          paymentId,
        ]
      );

      logger.info("Pagamento atualizado", {
        paymentId,
        status: payment.status,
      });
    } catch (error: any) {
      logger.error("Erro ao processar webhook", {
        error: error.message,
      });

      throw new Error("Erro ao processar webhook");
    }
  }
}