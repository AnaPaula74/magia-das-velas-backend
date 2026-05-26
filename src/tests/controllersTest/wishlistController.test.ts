import "../setup.js";
import { jest } from "@jest/globals";
import { WishlistController } from "../../controllers/wishlistController.js";
import { WishlistService } from "../../services/wishlistService.js";
import AuditService from "../../services/auditService.js";
import type { Response } from "express";

const mockResponse = () => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;

  return res;
};

describe("WishlistController", () => {
  let controller: WishlistController;

  beforeEach(() => {
    controller = new WishlistController();

    jest.clearAllMocks();

    jest.spyOn(AuditService.prototype, "log").mockResolvedValue();
  });

  it("adiciona produto na wishlist", async () => {
    jest.spyOn(WishlistService.prototype, "add").mockResolvedValue({
      id: 1,
    } as any);

    const req: any = {
      body: {
        productId: 1,
      },
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.add(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("remove produto da wishlist", async () => {
    jest.spyOn(WishlistService.prototype, "remove").mockResolvedValue(true as any);

    const req: any = {
      params: {
        productId: "1",
      },
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("lista wishlist", async () => {
    jest.spyOn(WishlistService.prototype, "list").mockResolvedValue([
      {
        id: 1,
        name: "Vela",
      },
    ] as any);

    const req: any = {
      user: {
        id: 1,
      },
    };

    const res = mockResponse();

    await controller.list(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});