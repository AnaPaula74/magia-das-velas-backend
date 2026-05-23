import { jest } from "@jest/globals";
import * as addressController from "../../controllers/addressController.js";
import AddressRepository from "../../repositories/addressRepository.js";
import type { Request, Response } from "express";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("AddressController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lista endereços do usuário", async () => {
    jest.spyOn(AddressRepository.prototype, "getByUser")
      .mockResolvedValue([{ id: 1, user_id: 1, street: "Rua A", city: "Cidade", state: "RJ", zip: "12345" }] as any);

    const req: any = { user: { id: 1 } };
    const res = mockResponse();

    await addressController.listAddresses(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: 1, user_id: 1, street: "Rua A", city: "Cidade", state: "RJ", zip: "12345" },
    ]);
  });

  it("cria endereço", async () => {
    jest.spyOn(AddressRepository.prototype, "create").mockResolvedValue();

    const req: any = { user: { id: 1 }, body: { street: "Rua B", city: "Cidade", state: "RJ", zip: "54321" } };
    const res = mockResponse();

    await addressController.addAddress(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Endereço criado com sucesso" });
  });
});
