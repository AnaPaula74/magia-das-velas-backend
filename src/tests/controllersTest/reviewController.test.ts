import { jest } from "@jest/globals";
import { ReviewController } from "../../controllers/reviewController.js";
import { ReviewService } from "../../services/reviewService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("ReviewController", () => {
  let controller: ReviewController;

  beforeEach(() => {
    controller = new ReviewController();
    jest.clearAllMocks();
  });

  it("cria review", async () => {
    jest.spyOn(ReviewService.prototype, "create").mockResolvedValue({ insertId: 1 } as any);

    const req: any = { user: { id: 1 }, body: { productId: 1, rating: 5, comment: "Ótimo" } };
    const res = mockResponse();

    await controller.create(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Review criada", // corrigido
      data: expect.objectContaining({ insertId: 1 }),
    });
  });

  it("retorna reviews e média", async () => {
    jest.spyOn(ReviewService.prototype, "getByProduct").mockResolvedValue([{ id: 1, rating: 5, comment: "Ótimo", name: "Ana" }] as any);
    jest.spyOn(ReviewService.prototype, "getAverage").mockResolvedValue({ average: 5 } as any);

    const req: any = { params: { productId: "1" } };
    const res = mockResponse();

    await controller.getByProduct(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { average: 5, reviews: [{ id: 1, rating: 5, comment: "Ótimo", name: "Ana" }] },
    });
  });
});
