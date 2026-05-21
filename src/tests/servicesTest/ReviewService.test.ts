import { jest } from "@jest/globals";
import { ReviewService } from "../../services/reviewService.js";
import { ValidationError, NotFoundError } from "../../errors/customErrors.js";
import { connection } from "../../config/database.js";

describe("ReviewService", () => {
  let service: ReviewService;

  beforeEach(() => {
    service = new ReviewService();
    jest.clearAllMocks();
  });

  it("lança ValidationError se nota fora do intervalo", async () => {
    await expect(service.create(1, 1, 6, "teste")).rejects.toThrow(ValidationError);
  });

  it("lança NotFoundError se não houver reviews", async () => {
    // mock da query para simular retorno vazio
    jest.spyOn(connection, "query").mockResolvedValue([[]] as any);

    await expect(service.getByProduct(999)).rejects.toThrow(NotFoundError);
  });

  it("lança NotFoundError se média não existir", async () => {
    // mock da query para simular média nula
    jest.spyOn(connection, "query").mockResolvedValue([[{ average: null }]] as any);

    await expect(service.getAverage(999)).rejects.toThrow(NotFoundError);
  });
});
