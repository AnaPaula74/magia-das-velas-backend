import type { Request, Response } from "express";

import AddressService from "../services/addressService.js";
import AuditService from "../services/auditService.js";
import type { CreateAddressDTO } from "../dtos/address/createAddress.dto.js";
import type { UpdateAddressDTO } from "../dtos/address/updateAddress.dto.js";
import { success, failure } from "../utils/httpResponses.js";
import { getErrorMessage, getErrorStatus } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";

export class AddressController {
  constructor(
    private addressService = new AddressService(),
    private auditService = new AuditService()
  ) {}

  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const addresses = await this.addressService.list(req.user.id);

      await this.auditService.log(
        req.user.id,
        "ADDRESS_LIST",
        `Consultou endereços (${addresses.length} encontrados)`
      );

      logger.info(`Endereços listados para usuário ${req.user.id}`);

      return success(res, 200, "Endereços listados", addresses);
    } catch (error: unknown) {
      logger.error("Erro ao listar endereços", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao listar endereços")
      );
    }
  }

  async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const addressId = Number(req.params.id);

      if (isNaN(addressId) || addressId <= 0) {
        return failure(res, 400, "ID do endereço inválido");
      }

      const address = await this.addressService.getById(addressId, req.user.id);

      logger.info(`Endereço ${addressId} consultado pelo usuário ${req.user.id}`);

      return success(res, 200, "Endereço encontrado com sucesso", address);
    } catch (error: unknown) {
      logger.error("Erro ao consultar endereço", {
        addressId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao consultar endereço")
      );
    }
  }

  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const street = req.body.street?.trim();
      const city = req.body.city?.trim();
      const state = req.body.state?.trim().toUpperCase();
      const zip = req.body.zip?.trim();

      if (!street || street.length < 5) {
        return failure(res, 400, "Rua deve ter no mínimo 5 caracteres");
      }

      if (!city || city.length < 3) {
        return failure(res, 400, "Cidade deve ter no mínimo 3 caracteres");
      }

      if (!state || state.length !== 2) {
        return failure(res, 400, "Estado deve ter exatamente 2 caracteres");
      }

      if (!this.isValidZip(zip)) {
        return failure(res, 400, "CEP inválido");
      }

      const dto: CreateAddressDTO = {
        userId: req.user.id,
        street,
        city,
        state,
        zip,
      };

      await this.addressService.create(dto);

      await this.auditService.log(
        req.user.id,
        "ADDRESS_CREATE",
        `Endereço criado: ${street}, ${city}-${state}`
      );

      logger.info(`Endereço criado para usuário ${req.user.id}`);

      return success(res, 201, "Endereço criado com sucesso");
    } catch (error: unknown) {
      logger.error("Erro ao criar endereço", { userId: req.user?.id, error });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao criar endereço")
      );
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const addressId = Number(req.params.id);

      if (isNaN(addressId) || addressId <= 0) {
        return failure(res, 400, "ID do endereço inválido");
      }

      const street = req.body.street?.trim();
      const city = req.body.city?.trim();
      const state = req.body.state?.trim().toUpperCase();
      const zip = req.body.zip?.trim();

      if (street && street.length < 5) {
        return failure(res, 400, "Rua deve ter no mínimo 5 caracteres");
      }

      if (city && city.length < 3) {
        return failure(res, 400, "Cidade deve ter no mínimo 3 caracteres");
      }

      if (state && state.length !== 2) {
        return failure(res, 400, "Estado deve ter exatamente 2 caracteres");
      }

      if (zip && !this.isValidZip(zip)) {
        return failure(res, 400, "CEP inválido");
      }

      const dto: UpdateAddressDTO = {
        userId: req.user.id,
        street,
        city,
        state,
        zip,
      };

      await this.addressService.update(addressId, dto);

      await this.auditService.log(
        req.user.id,
        "ADDRESS_UPDATE",
        `Endereço ${addressId} atualizado`
      );

      logger.info(`Endereço ${addressId} atualizado para usuário ${req.user.id}`);

      return success(res, 200, "Endereço atualizado com sucesso");
    } catch (error: unknown) {
      logger.error("Erro ao atualizar endereço", {
        addressId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao atualizar endereço")
      );
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return failure(res, 401, "Usuário não autenticado");
      }

      const addressId = Number(req.params.id);

      if (isNaN(addressId) || addressId <= 0) {
        return failure(res, 400, "ID do endereço inválido");
      }

      await this.addressService.delete(addressId, req.user.id);

      await this.auditService.log(
        req.user.id,
        "ADDRESS_DELETE",
        `Endereço ${addressId} removido`
      );

      logger.info(`Endereço ${addressId} removido para usuário ${req.user.id}`);

      return success(res, 200, "Endereço removido com sucesso");
    } catch (error: unknown) {
      logger.error("Erro ao deletar endereço", {
        addressId: req.params.id,
        userId: req.user?.id,
        error,
      });
      return failure(
        res,
        getErrorStatus(error),
        getErrorMessage(error, "Erro ao deletar endereço")
      );
    }
  }

  private isValidZip(zip: string): boolean {
    const zipRegex = /^\d{5}-?\d{3}$/;
    return zipRegex.test(zip);
  }
}

const controller = new AddressController();
export const listAddresses = (req: Request, res: Response) =>
  controller.list(req, res);
export const addAddress = (req: Request, res: Response) =>
  controller.create(req, res);
export const updateAddress = (req: Request, res: Response) =>
  controller.update(req, res);
export const deleteAddress = (req: Request, res: Response) =>
  controller.delete(req, res);

export default controller;
