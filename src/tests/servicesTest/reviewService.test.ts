import "../setup.js";
import { jest } from "@jest/globals";

import { ReviewService } from "../../services/reviewService.js";

import { ValidationError } from "../../errors/customErrors.js";

import { connection } from "../../config/database.js";

describe("ReviewService", () => {
  let service: ReviewService;

  beforeEach(() => {
    service = new ReviewService();

    jest.clearAllMocks();
  });

  it("lança ValidationError se nota fora do intervalo", async () => {
    await expect(
      service.create(1, 1, 6, "teste")
    ).rejects.toThrow(ValidationError);
  });

  it("retorna lista vazia se não houver reviews", async () => {
    jest
      .spyOn(connection, "query")
      .mockResolvedValue([[]] as any);

    await expect(
      service.getByProduct(999)
    ).resolves.toEqual([]);
  });

  it("retorna média zerada se avaliação não existir", async () => {
    jest
      .spyOn(connection, "query")
      .mockResolvedValue([[{ average: null }]] as any);

    await expect(
      service.getAverage(999)
    ).resolves.toEqual({
      average: 0,
      totalRatings: 0,
    });
  });
});
