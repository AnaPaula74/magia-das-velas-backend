import { jest } from "@jest/globals";
import { WishlistService } from "../../services/wishlistService.js";
import { ValidationError, NotFoundError } from "../../errors/customErrors.js";
import { connection } from "../../config/database.js";

describe("WishlistService", () => {
  let service: WishlistService;

  beforeEach(() => {
    service = new WishlistService();
    jest.clearAllMocks();
  });

  it("lança ValidationError se productId inválido", async () => {
    await expect(service.add(1, 0)).rejects.toThrow(ValidationError);
  });

  it("lança NotFoundError se remover produto inexistente", async () => {
    // mock da query para simular remoção sem sucesso
    jest.spyOn(connection, "query").mockResolvedValue([{ affectedRows: 0 }] as any);

    await expect(service.remove(1, 999)).rejects.toThrow(NotFoundError);
  });

  it("lança NotFoundError se wishlist vazia", async () => {
    // mock da query para simular lista vazia
    jest.spyOn(connection, "query").mockResolvedValue([[]] as any);

    await expect(service.list(1)).rejects.toThrow(NotFoundError);
  });
});
