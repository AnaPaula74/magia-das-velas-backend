import "../setup.js";
import { jest } from "@jest/globals";

import CartService from "../../services/cartService.js";
import {
  ValidationError,
  NotFoundError,
} from "../../errors/customErrors.js";

import { connection } from "../../config/database.js";

describe("CartService", () => {
  let service: CartService;

  beforeEach(() => {
    service = new CartService();

    jest.clearAllMocks();
  });

  it("lança ValidationError se quantidade <= 0 ao adicionar ao carrinho", async () => {
    await expect(
      service.addToCart(1, 1, 0)
    ).rejects.toThrow(ValidationError);
  });

  it("lança ValidationError se quantidade <= 0 ao atualizar item", async () => {
    await expect(
      service.updateQuantity(1, 999, 0)
    ).rejects.toThrow(ValidationError);
  });

  it("lança NotFoundError se updateQuantity não encontrar item do usuário", async () => {
    jest
      .spyOn(connection, "query")
      .mockResolvedValue([[]] as any);

    await expect(
      service.updateQuantity(1, 999, 2)
    ).rejects.toThrow(NotFoundError);

    expect(connection.query).toHaveBeenCalledWith(
      `SELECT id, product_id, quantity
       FROM cart_items
       WHERE id = ? AND user_id = ?`,
      [999, 1]
    );
  });

  it("retorna carrinho vazio sem erro", async () => {
    jest
      .spyOn(connection, "query")
      .mockResolvedValue([[]] as any);

    await expect(
      service.getCart(1)
    ).resolves.toEqual({
      items: [],
      total: 0,
    });
  });

  it("lança NotFoundError se remover item inexistente do usuário", async () => {
    jest
      .spyOn(connection, "query")
      .mockResolvedValue([{ affectedRows: 0 }] as any);

    await expect(
      service.removeFromCart(1, 999)
    ).rejects.toThrow(NotFoundError);

    expect(connection.query).toHaveBeenCalledWith(
      `DELETE FROM cart_items
       WHERE id = ? AND user_id = ?`,
      [999, 1]
    );
  });
});
