import "../setup.js";
import { jest } from "@jest/globals";

import { PaymentService } from "../../services/paymentService.js";
import PaymentRepository from "../../repositories/paymentRepository.js";
import OrderRepository from "../../repositories/orderRepository.js";
import UserRepository from "../../repositories/userRepository.js";
import { OrderStatus } from "../../enums/orderStatus.js";

describe("PaymentService webhook", () => {
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let orderRepository: jest.Mocked<OrderRepository>;
  let service: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();

    paymentRepository = {
      create: jest.fn(),
      updateStatus: jest.fn(),
      findByIdForUser: jest.fn(),
      findByReferenceForUser: jest.fn(),
      findByPaymentId: jest.fn(),
      updateLocalStatusById: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepository>;

    orderRepository = {
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<OrderRepository>;

    service = new PaymentService(
      paymentRepository,
      orderRepository,
      {} as UserRepository
    );
  });

  it("atualiza pagamento e pedido aprovado recebido pelo webhook", async () => {
    jest.spyOn(service as any, "getMercadoPagoPayment").mockReturnValue({
      get: jest.fn(async () => ({
        status: "approved",
      })),
    });

    paymentRepository.updateStatus.mockResolvedValue({ affectedRows: 1 } as any);
    paymentRepository.findByPaymentId.mockResolvedValue({
      order_id: 77,
    } as any);
    orderRepository.updateStatus.mockResolvedValue({ affectedRows: 1 } as any);

    await service.processWebhook({
      type: "payment",
      data: {
        id: 123456,
      },
    });

    expect(paymentRepository.updateStatus).toHaveBeenCalledWith(
      123456,
      "approved"
    );
    expect(paymentRepository.findByPaymentId).toHaveBeenCalledWith(123456);
    expect(orderRepository.updateStatus).toHaveBeenCalledWith(
      77,
      OrderStatus.PAID
    );
  });

  it("ignora webhook que não é de pagamento", async () => {
    const getMercadoPagoPaymentSpy = jest.spyOn(
      service as any,
      "getMercadoPagoPayment"
    );

    await service.processWebhook({
      type: "merchant_order",
      data: {
        id: 123456,
      },
    });

    expect(getMercadoPagoPaymentSpy).not.toHaveBeenCalled();
    expect(paymentRepository.updateStatus).not.toHaveBeenCalled();
    expect(orderRepository.updateStatus).not.toHaveBeenCalled();
  });
});
