import "../setup.js";
import { jest } from "@jest/globals";

import type { Request, Response } from "express";

import {
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../../controllers/addressController.js";

import AddressRepository from "../../repositories/addressRepository.js";
import AuditService from "../../services/auditService.js";

const mockResponse = (): Response => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnThis() as any;
  res.json = jest.fn().mockReturnThis() as any;

  return res;
};

describe("AddressController", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(AuditService.prototype, "log").mockResolvedValue(undefined as any);
  });

  describe("listAddresses", () => {
    it("lista endereços do usuário", async () => {
      const addresses = [
        {
          id: 1,
          street: "Rua A",
          city: "Rio",
        },
      ];

      jest
        .spyOn(AddressRepository.prototype, "getByUser")
        .mockResolvedValue(addresses as any);

      const req = {
        user: { id: 1 },
      } as Request;

      const res = mockResponse();

      await listAddresses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Endereços listados",
        data: addresses,
      });
    });

    it("retorna erro se usuário não estiver autenticado", async () => {
      const req = {} as Request;

      const res = mockResponse();

      await listAddresses(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Usuário não autenticado",
      });
    });

    it("retorna erro interno", async () => {
      jest
        .spyOn(AddressRepository.prototype, "getByUser")
        .mockRejectedValue(new Error("Erro interno"));

      const req = {
        user: { id: 1 },
      } as any;

      const res = mockResponse();

      await listAddresses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Erro interno",
      });
    });
  });

  describe("addAddress", () => {
    it("cria endereço", async () => {
      jest
        .spyOn(AddressRepository.prototype, "create")
        .mockResolvedValue({} as any);

      const req = {
        user: { id: 1 },
        body: {
          street: "Rua Teste",
          city: "Rio",
          state: "RJ",
          zip: "20000-000",
        },
      } as any;

      const res = mockResponse();

      await addAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Endereço criado com sucesso",
      });
    });

    it("retorna erro se usuário não estiver autenticado", async () => {
      const req = {
        body: {},
      } as Request;

      const res = mockResponse();

      await addAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Usuário não autenticado",
      });
    });

    it("retorna erro interno", async () => {
      jest
        .spyOn(AddressRepository.prototype, "create")
        .mockRejectedValue(new Error("Erro ao criar"));

      const req = {
        user: { id: 1 },
        body: {
          street: "Rua Teste",
          city: "Rio",
          state: "RJ",
          zip: "20000-000",
        },
      } as any;

      const res = mockResponse();

      await addAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Erro ao criar",
      });
    });
  });

  describe("updateAddress", () => {
    it("atualiza endereço", async () => {
      jest
        .spyOn(AddressRepository.prototype, "update")
        .mockResolvedValue({} as any);

      const req = {
        user: { id: 1 },
        params: { id: "1" },
        body: {
          street: "Rua Nova",
          city: "Rio",
          state: "RJ",
          zip: "21000-000",
        },
      } as any;

      const res = mockResponse();

      await updateAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Endereço atualizado com sucesso",
      });
    });

    it("retorna erro interno", async () => {
      jest
        .spyOn(AddressRepository.prototype, "update")
        .mockRejectedValue(new Error("Erro ao atualizar"));

      const req = {
        user: { id: 1 },
        params: { id: "1" },
        body: {},
      } as any;

      const res = mockResponse();

      await updateAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Erro ao atualizar",
      });
    });
  });

  describe("deleteAddress", () => {
    it("remove endereço", async () => {
      jest
        .spyOn(AddressRepository.prototype, "delete")
        .mockResolvedValue({} as any);

      const req = {
        user: { id: 1 },
        params: { id: "1" },
      } as any;

      const res = mockResponse();

      await deleteAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Endereço removido com sucesso",
      });
    });

    it("retorna erro interno", async () => {
      jest
        .spyOn(AddressRepository.prototype, "delete")
        .mockRejectedValue(new Error("Erro ao remover"));

      const req = {
        user: { id: 1 },
        params: { id: "1" },
      } as any;

      const res = mockResponse();

      await deleteAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Erro ao remover",
      });
    });
  });
});