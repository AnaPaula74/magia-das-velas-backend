import { jest } from "@jest/globals";
import CartService from "../../services/cartService.js";
import { ValidationError, NotFoundError } from "../../errors/customErrors.js";
import { connection } from "../../config/database.js";

describe("CartService", () => {
  let service: CartService;

  beforeEach(() => {
    service = new CartService();
    jest.clearAllMocks();
  });

  it("lança ValidationError se quantidade <= 0", async () => {
    await expect(service.addToCart(1, 1, 0)).rejects.toThrow(ValidationError);
  });

  it("lança NotFoundError se updateQuantity não encontrar item", async () => {
    // mock da query para simular item inexistente
    jest.spyOn(connection, "query").mockResolvedValue([{ affectedRows: 0 }] as any);

    await expect(service.updateQuantity(999, 2)).rejects.toThrow(NotFoundError);
  });

  it("lança NotFoundError se carrinho vazio", async () => {
    // mock da query para simular carrinho vazio
    jest.spyOn(connection, "query").mockResolvedValue([[]] as any);

    await expect(service.getCart(1)).rejects.toThrow(NotFoundError);
  });
});
