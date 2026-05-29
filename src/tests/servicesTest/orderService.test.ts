import "../setup.js";
import { jest } from "@jest/globals";

import { OrderService } from "../../services/orderService.js";
import OrderRepository from "../../repositories/orderRepository.js";
import { OrderStatus } from "../../enums/orderStatus.js";
import { ValidationError } from "../../errors/customErrors.js";

describe("OrderService", () => {
  const mockConnection = {
    beginTransaction: jest.fn(async () => undefined),
    commit: jest.fn(async () => undefined),
    rollback: jest.fn(async () => undefined),
    release: jest.fn(),
  };

  let repository: jest.Mocked<OrderRepository>;
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();

    repository = {
      getConnection: jest.fn(async () => mockConnection as any),
      getCartItemsForCheckout: jest.fn(),
      getProductStockForUpdate: jest.fn(),
      createOrder: jest.fn(),
      createOrderItem: jest.fn(),
      decreaseStock: jest.fn(),
      clearCart: jest.fn(),
      getOrdersByUser: jest.fn(),
      getAllOrders: jest.fn(),
      getOrderByIdForAdmin: jest.fn(),
      getOrderByIdForUser: jest.fn(),
      findByIdForUser: jest.fn(),
      getOrderItems: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<OrderRepository>;

    service = new OrderService(repository);
  });

  it("faz checkout transacional com baixa de estoque e limpeza do carrinho", async () => {
    repository.getCartItemsForCheckout.mockResolvedValue([
      {
        product_id: 10,
        quantity: 2,
        price: 20,
      } as any,
      {
        product_id: 20,
        quantity: 1,
        price: 15,
      } as any,
    ]);
    repository.getProductStockForUpdate.mockResolvedValue({ stock: 10 } as any);
    repository.createOrder.mockResolvedValue({ insertId: 99 } as any);
    repository.createOrderItem.mockResolvedValue({ affectedRows: 1 } as any);
    repository.decreaseStock.mockResolvedValue({ affectedRows: 1 } as any);
    repository.clearCart.mockResolvedValue({ affectedRows: 2 } as any);

    const result = await service.checkout({ userId: 1 });

    expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);
    expect(repository.createOrder).toHaveBeenCalledWith(
      mockConnection,
      1,
      55,
      OrderStatus.PENDING
    );
    expect(repository.createOrderItem).toHaveBeenCalledTimes(2);
    expect(repository.decreaseStock).toHaveBeenCalledWith(mockConnection, 10, 2);
    expect(repository.decreaseStock).toHaveBeenCalledWith(mockConnection, 20, 1);
    expect(repository.clearCart).toHaveBeenCalledWith(mockConnection, 1);
    expect(mockConnection.commit).toHaveBeenCalledTimes(1);
    expect(mockConnection.rollback).not.toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        orderId: 99,
        total: 55,
        status: OrderStatus.PENDING,
      })
    );
  });

  it("faz rollback quando estoque é insuficiente", async () => {
    repository.getCartItemsForCheckout.mockResolvedValue([
      {
        product_id: 10,
        quantity: 5,
        price: 20,
      } as any,
    ]);
    repository.getProductStockForUpdate.mockResolvedValue({ stock: 2 } as any);

    await expect(service.checkout({ userId: 1 })).rejects.toBeInstanceOf(
      ValidationError
    );

    expect(repository.createOrder).not.toHaveBeenCalled();
    expect(mockConnection.commit).not.toHaveBeenCalled();
    expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
    expect(mockConnection.release).toHaveBeenCalledTimes(1);
  });
});
