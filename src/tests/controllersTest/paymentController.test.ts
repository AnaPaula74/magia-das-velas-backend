import "../setup.js";
import crypto from "crypto";
import { jest } from "@jest/globals";
import { PaymentController } from "../../controllers/paymentController.js";
import { PaymentService } from "../../services/paymentService.js";
import AuditService from "../../services/auditService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;

  return res;
};

const createMercadoPagoSignature = ({
  dataId,
  requestId,
  ts,
  secret,
}: {
  dataId: string;
  requestId: string;
  ts: string;
  secret: string;
}) => {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return `ts=${ts},v1=${signature}`;
};

describe("PaymentController", () => {
  let controller: PaymentController;

  beforeEach(() => {
    controller = new PaymentController();

    jest.clearAllMocks();


    jest.spyOn(AuditService.prototype, "log").mockResolvedValue(undefined);
  });

  it("cria pagamento pix", async () => {
    const generatePixSpy = jest
      .spyOn(PaymentService.prototype, "generatePixMercadoPago")
      .mockResolvedValue({
        orderId: 1,
        paymentId: 123456,
        amount: 100,
        status: "pending",
        pix: {
          qr_code: "123",
          qr_code_base64: "base64",
        },
      } as any);

    const req: any = {
      body: {
        orderId: 1,
      },
      user: {
        id: 1,
        email: "ana@test.com",
        role: "user",
      },
    };

    const res = mockResponse();

    await controller.createPixPayment(req, res);

    expect(generatePixSpy).toHaveBeenCalledWith({
      userId: 1,
      orderId: 1,
    });

    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      1,
      "PIX_PAYMENT",
      "Pagamento Pix criado para pedido 1"
    );

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Pagamento Pix criado",
      data: {
        orderId: 1,
        paymentId: 123456,
        amount: 100,
        status: "pending",
        pix: {
          qr_code: "123",
          qr_code_base64: "base64",
        },
      },
    });
  });

  it("cria checkout mercado pago", async () => {
    const generateCheckoutSpy = jest
      .spyOn(PaymentService.prototype, "generateMercadoPago")
      .mockResolvedValue({
        orderId: 1,
        paymentId: "checkout-123",
        amount: 200,
        status: "pending",
        init_point: "https://mercadopago.com/checkout",
        sandbox_init_point: "https://sandbox.mercadopago.com/checkout",
      } as any);

    const req: any = {
      body: {
        orderId: 1,
      },
      user: {
        id: 1,
        email: "ana@test.com",
        role: "user",
      },
    };

    const res = mockResponse();

    await controller.createMercadoPagoPayment(req, res);

    expect(generateCheckoutSpy).toHaveBeenCalledWith({
      userId: 1,
      orderId: 1,
    });

    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      1,
      "MERCADO_PAGO_PAYMENT",
      "Checkout Mercado Pago criado para pedido 1"
    );

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Checkout Mercado Pago criado",
      data: {
        orderId: 1,
        paymentId: "checkout-123",
        amount: 200,
        status: "pending",
        init_point: "https://mercadopago.com/checkout",
        sandbox_init_point: "https://sandbox.mercadopago.com/checkout",
      },
    });
  });

  it("processa webhook com assinatura válida", async () => {
    const webhookSpy = jest
      .spyOn(PaymentService.prototype, "processWebhook")
      .mockResolvedValue(undefined);

    const requestId = "request-test-123";
    const ts = "1710000000";
    const dataId = "123456";
    const secret = "test_webhook_secret";

    const signature = createMercadoPagoSignature({
      dataId,
      requestId,
      ts,
      secret,
    });

    const req: any = {
      body: {
        type: "payment",
        data: {
          id: 123456,
        },
      },
      query: {
        "data.id": dataId,
      },
      header: jest.fn((name: string) => {
        const headers: Record<string, string> = {
          "x-signature": signature,
          "x-request-id": requestId,
        };

        return headers[name.toLowerCase()];
      }),
    };

    const res = mockResponse();

    await controller.handleWebhook(req, res);

    expect(webhookSpy).toHaveBeenCalledWith({
      type: "payment",
      data: {
        id: 123456,
      },
    });

    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      0,
      "WEBHOOK",
      "Webhook Mercado Pago processado"
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Webhook processado",
    });
  });

  it("retorna 401 ao tentar criar pix sem usuário autenticado", async () => {
    const generatePixSpy = jest.spyOn(
      PaymentService.prototype,
      "generatePixMercadoPago"
    );

    const req: any = {
      body: {
        orderId: 1,
      },
    };

    const res = mockResponse();

    await controller.createPixPayment(req, res);

    expect(generatePixSpy).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Usuário não autenticado",
    });
  });

  it("retorna 401 ao tentar criar checkout sem usuário autenticado", async () => {
    const generateCheckoutSpy = jest.spyOn(
      PaymentService.prototype,
      "generateMercadoPago"
    );

    const req: any = {
      body: {
        orderId: 1,
      },
    };

    const res = mockResponse();

    await controller.createMercadoPagoPayment(req, res);

    expect(generateCheckoutSpy).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Usuário não autenticado",
    });
  });

  it("retorna erro ao processar webhook sem assinatura", async () => {
    const webhookSpy = jest.spyOn(
      PaymentService.prototype,
      "processWebhook"
    );

    const req: any = {
      body: {
        type: "payment",
        data: {
          id: 123456,
        },
      },
      query: {
        "data.id": "123456",
      },
      header: jest.fn(() => undefined),
    };

    const res = mockResponse();

    await controller.handleWebhook(req, res);

    expect(webhookSpy).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Webhook sem assinatura válida",
    });
  });
});