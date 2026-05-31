import "../setup.js";
import { jest } from "@jest/globals";

import { PosService } from "../../services/posService.js";
import PosRepository from "../../repositories/posRepository.js";
import { OrderStatus } from "../../enums/orderStatus.js";
import { NotFoundError, ValidationError } from "../../errors/customErrors.js";

describe("PosService", () => {
  const mockConnection = {
    beginTransaction: jest.fn(async () => undefined),
    commit: jest.fn(async () => undefined),
    rollback: jest.fn(async () => undefined),
    release: jest.fn(),
  } as any;

  let repository: jest.Mocked<PosRepository>;
  let service: PosService;

  beforeEach(() => {
    jest.clearAllMocks();

    repository = {
      getConnection: jest.fn(async () => mockConnection),
      getProductByIdForUpdate: jest.fn(),
      createOrder: jest.fn(),
      createOrderItem: jest.fn(),
      decreaseStock: jest.fn(),
      increaseStock: jest.fn(),
      getSales: jest.fn(),
      getSaleById: jest.fn(),
      getSaleItems: jest.fn(),
      cancelSale: jest.fn(),
    } as unknown as jest.Mocked<PosRepository>;

    service = new PosService(repository);
  });

  it("cria venda POS com baixa de estoque e commit transacional", async () => {
    repository.getProductByIdForUpdate.mockResolvedValue({
      id: 1,
      name: "Vela Aromática",
      physical_price: 12.5,
      stock: 5,
    } as any);
    repository.createOrder.mockResolvedValue({ insertId: 100 } as any);
    repository.createOrderItem.mockResolvedValue({ affectedRows: 1 } as any);
    repository.decreaseStock.mockResolvedValue({ affectedRows: 1 } as any);
    repository.getSaleById.mockResolvedValue({
      id: 100,
      user_id: 10,
      sold_by_user_id: 10,
      sold_by_user_name: "Caixa 1",
      total: 25,
      status: OrderStatus.PAID,
      source: "pos",
      payment_method: "cash",
      customer_name: null,
      customer_phone: null,
      paid_at: new Date(),
      cancelled_at: null,
      created_at: new Date(),
    } as any);
    repository.getSaleItems.mockResolvedValue([
      {
        id: 1,
        order_id: 100,
        product_id: 1,
        quantity: 2,
        price: 12.5,
        name: "Vela Aromática",
        image_url: null,
      } as any,
    ]);

    const result = await service.createSale(
      {
        paymentMethod: "cash",
        items: [{ productId: 1, quantity: 2 }],
      },
      10
    );

    expect(repository.getConnection).toHaveBeenCalledTimes(1);
    expect(repository.createOrder).toHaveBeenCalledWith(
      mockConnection,
      10,
      25,
      OrderStatus.PAID,
      "pos",
      "cash",
      10,
      null,
      null,
      expect.any(Date)
    );
    expect(repository.createOrderItem).toHaveBeenCalledWith(
      mockConnection,
      100,
      1,
      2,
      12.5
    );
    expect(repository.decreaseStock).toHaveBeenCalledWith(mockConnection, 1, 2);
    expect(mockConnection.commit).toHaveBeenCalledTimes(1);
    expect(mockConnection.rollback).not.toHaveBeenCalled();

    expect(result).toEqual(
      expect.objectContaining({
        orderId: 100,
        id: 100,
        total: 25,
        status: OrderStatus.PAID,
        payment_method: "cash",
        items: [
          expect.objectContaining({
            order_id: 100,
            product_id: 1,
            quantity: 2,
            price: 12.5,
            name: "Vela Aromática",
          }),
        ],
      })
    );
  });

  it("faz rollback quando estoque é insuficiente", async () => {
    repository.getProductByIdForUpdate.mockResolvedValue({
      id: 1,
      name: "Vela Aromática",
      physical_price: 12.5,
      stock: 1,
    } as any);

    await expect(
      service.createSale(
        {
          paymentMethod: "cash",
          items: [{ productId: 1, quantity: 2 }],
        },
        10
      )
    ).rejects.toBeInstanceOf(ValidationError);

    expect(repository.createOrder).not.toHaveBeenCalled();
    expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
    expect(mockConnection.release).toHaveBeenCalledTimes(1);
  });

  it("filtra vendas POS pelo caixa quando role cashier", async () => {
    repository.getSales.mockResolvedValue([{ id: 1 } as any]);

    const result = await service.getSales(5, "cashier", {
      paymentMethod: "card",
      status: "paid",
    });

    expect(repository.getSales).toHaveBeenCalledWith(5, "card", "paid");
    expect(result).toEqual([{ id: 1 }]);
  });

  it("não permite que cashier acesse venda de outro operador", async () => {
    repository.getSaleById.mockResolvedValue({
      id: 1,
      sold_by_user_id: 10,
      status: OrderStatus.PAID,
    } as any);

    await expect(service.getSaleById(1, 2, "cashier")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it("cancela venda POS e repõe o estoque", async () => {
    repository.getSaleById.mockResolvedValue({
      id: 1,
      status: OrderStatus.PAID,
    } as any);
    repository.getSaleItems.mockResolvedValue([
      { product_id: 1, quantity: 3 } as any,
    ]);
    repository.cancelSale.mockResolvedValue({ affectedRows: 1 } as any);
    repository.increaseStock.mockResolvedValue({ affectedRows: 1 } as any);

    const result = await service.cancelSale(1);

    expect(repository.cancelSale).toHaveBeenCalledWith(mockConnection, 1);
    expect(repository.increaseStock).toHaveBeenCalledWith(mockConnection, 1, 3);
    expect(mockConnection.commit).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        orderId: 1,
        status: OrderStatus.CANCELLED,
        cancelled: true,
      })
    );
  });
});
