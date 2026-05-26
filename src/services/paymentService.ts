import { randomUUID } from "crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { logger } from "../utils/logger.js";
import {
  ConfigError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../errors/customErrors.js";
import { env } from "../config/env.js";
import PaymentRepository from "../repositories/paymentRepository.js";
import OrderRepository from "../repositories/orderRepository.js";
import UserRepository from "../repositories/userRepository.js";
import { OrderStatus } from "../enums/orderStatus.js";

interface CreatePaymentDTO {
  userId: number;
  orderId: number;
}

interface MercadoPagoWebhookPayload {
  type?: string;
  data?: {
    id?: string | number;
  };
}

export class PaymentService {
  private payment?: Payment;
  private preference?: Preference;

  constructor(
    private paymentRepository = new PaymentRepository(),
    private orderRepository = new OrderRepository(),
    private userRepository = new UserRepository()
  ) {}

  private getMercadoPagoPayment() {
    const accessToken = env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new ConfigError(
        "MERCADO_PAGO_ACCESS_TOKEN não configurado"
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
    });

    this.payment ??= new Payment(client);

    return this.payment;
  }

  private getMercadoPagoPreference() {
    const accessToken = env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new ConfigError(
        "MERCADO_PAGO_ACCESS_TOKEN não configurado"
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
    });

    this.preference ??= new Preference(client);

    return this.preference;
  }

  private async getPayableOrder(userId: number, orderId: number) {
    const order = await this.orderRepository.findByIdForUser(
      orderId,
      userId
    );

    if (!order) {
      throw new NotFoundError("Pedido não encontrado");
    }

    if (order.status !== "pending") {
      throw new ValidationError(
        "Este pedido não está disponível para pagamento"
      );
    }

    return order;
  }

  async generatePixMercadoPago(data: CreatePaymentDTO) {
    try {
      const order = await this.getPayableOrder(
        data.userId,
        data.orderId
      );

      const user = await this.userRepository.getById(data.userId);

      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      const amount = Number(order.total);
      const description = `Pedido #${order.id} - Magia das Velas`;

      const result = await this.getMercadoPagoPayment().create({
        body: {
          transaction_amount: amount,
          description,
          payment_method_id: "pix",
          payer: {
            email: user.email,
          },
        },
      });

      if (!result.id) {
        throw new InternalServerError(
          "Mercado Pago não retornou o ID do pagamento"
        );
      }

      await this.paymentRepository.create(
        order.id,
        result.id,
        "pix",
        amount,
        "pending",
        description
      );

      logger.info("Pagamento Pix criado", {
        orderId: order.id,
        paymentId: result.id,
        amount,
      });

      return {
        orderId: order.id,
        paymentId: result.id,
        amount,
        status: "pending",
        pix: result.point_of_interaction?.transaction_data,
      };
    } catch (error: unknown) {
      logger.error("Erro ao gerar Pix Mercado Pago", {
        error,
      });

      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof ConfigError
      ) {
        throw error;
      }

      throw new InternalServerError(
        "Falha ao criar pagamento Pix"
      );
    }
  }

  async generateMercadoPago(data: CreatePaymentDTO) {
    try {
      const order = await this.getPayableOrder(
        data.userId,
        data.orderId
      );

      const amount = Number(order.total);
      const description = `Pedido #${order.id} - Magia das Velas`;

      const result = await this.getMercadoPagoPreference().create({
        body: {
          external_reference: String(order.id),
          items: [
            {
              id: randomUUID(),
              title: description,
              quantity: 1,
              currency_id: "BRL",
              unit_price: amount,
            },
          ],
          back_urls: {
            success: `${env.APP_URL}/payment/success`,
            failure: `${env.APP_URL}/payment/failure`,
            pending: `${env.APP_URL}/payment/pending`,
          },
          auto_return: "approved",
        },
      });

      if (!result.id) {
        throw new InternalServerError(
          "Mercado Pago não retornou o ID do checkout"
        );
      }

      await this.paymentRepository.create(
        order.id,
        result.id,
        "mercadopago",
        amount,
        "pending",
        description
      );

      logger.info("Checkout Mercado Pago criado", {
        orderId: order.id,
        paymentId: result.id,
        amount,
      });

      return {
        orderId: order.id,
        paymentId: result.id,
        amount,
        status: "pending",
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
      };
    } catch (error: unknown) {
      logger.error("Erro ao criar checkout Mercado Pago", {
        error,
      });

      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof ConfigError
      ) {
        throw error;
      }

      throw new InternalServerError(
        "Falha ao criar checkout Mercado Pago"
      );
    }
  }

  async processWebhook(payload: MercadoPagoWebhookPayload) {
    try {
      logger.info("Webhook Mercado Pago recebido", {
        payload,
      });

      if (payload.type !== "payment") {
        return;
      }

      const paymentId = payload.data?.id;

      if (!paymentId) {
        throw new ValidationError(
          "ID do pagamento não informado no webhook"
        );
      }

      const payment = await this.getMercadoPagoPayment().get({
        id: paymentId,
      });

      if (!payment.status) {
        throw new InternalServerError(
          "Mercado Pago não retornou status do pagamento"
        );
      }

      await this.paymentRepository.updateStatus(
        paymentId,
        payment.status
      );

      const localPayment = await this.paymentRepository.findByPaymentId(paymentId);
      const nextOrderStatus = this.mapPaymentStatusToOrderStatus(payment.status);

      if (localPayment && nextOrderStatus) {
        await this.orderRepository.updateStatus(localPayment.order_id, nextOrderStatus);
      }

      logger.info("Pagamento atualizado via webhook", {
        paymentId,
        status: payment.status,
      });
    } catch (error: unknown) {
      logger.error("Erro ao processar webhook", {
        error,
      });

      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ConfigError
      ) {
        throw error;
      }

      throw new InternalServerError(
        "Erro ao processar webhook"
      );
    }
  }

  async getPaymentStatus(paymentId: number | string, userId: number) {
    const payment = await this.paymentRepository.findByIdForUser(
      paymentId,
      userId
    );

    if (!payment) {
      throw new NotFoundError("Pagamento não encontrado");
    }

    return {
      id: payment.id,
      paymentId: payment.payment_id,
      orderId: payment.order_id,
      method: payment.method,
      amount: Number(payment.amount),
      status: payment.status,
      description: payment.description,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    };
  }

  async cancelPayment(paymentId: number | string, userId: number) {
    const payment = await this.paymentRepository.findByIdForUser(
      paymentId,
      userId
    );

    if (!payment) {
      throw new NotFoundError("Pagamento não encontrado");
    }

    if (["approved", "paid", "cancelled"].includes(payment.status)) {
      throw new ValidationError("Este pagamento não pode ser cancelado");
    }

    const result = await this.paymentRepository.updateLocalStatusById(
      payment.id,
      "cancelled"
    );

    if (result.affectedRows === 0) {
      throw new NotFoundError("Pagamento não encontrado");
    }

    await this.orderRepository.updateStatus(payment.order_id, OrderStatus.CANCELLED);

    return {
      id: payment.id,
      status: "cancelled",
      cancelled: true,
    };
  }

  private mapPaymentStatusToOrderStatus(status: string): OrderStatus | null {
    if (status === "approved" || status === "paid") {
      return OrderStatus.PAID;
    }

    if (["cancelled", "rejected", "refunded", "charged_back"].includes(status)) {
      return OrderStatus.CANCELLED;
    }

    return null;
  }
}
