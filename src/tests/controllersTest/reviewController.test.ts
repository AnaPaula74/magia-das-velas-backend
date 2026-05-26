import "../setup.js";
import { jest } from "@jest/globals";
import { ReviewController } from "../../controllers/reviewController.js";
import { ReviewService } from "../../services/reviewService.js";
import AuditService from "../../services/auditService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;

  return res;
};

describe("ReviewController", () => {
  let controller: ReviewController;

  beforeEach(() => {
    controller = new ReviewController();

    jest.clearAllMocks();

    jest.spyOn(AuditService.prototype, "log").mockResolvedValue();
  });

  it("cria review", async () => {
    jest.spyOn(ReviewService.prototype, "create").mockResolvedValue({
      id: 1,
      rating: 5,
    } as any);

    const req: any = {
      body: {
        productId: 1,
        rating: 5,
        comment: "Muito bom",
      },
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("lista reviews do produto", async () => {
    jest.spyOn(ReviewService.prototype, "getByProduct").mockResolvedValue([
      {
        id: 1,
        rating: 5,
      },
    ] as any);

    jest.spyOn(ReviewService.prototype, "getAverage").mockResolvedValue({
      average: 4.5,
    } as any);

    const req: any = {
      params: {
        productId: "1",
      },
    };

    const res = mockResponse();

    await controller.getByProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});