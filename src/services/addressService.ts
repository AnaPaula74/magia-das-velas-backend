import AddressRepository from "../repositories/addressRepository.js";
import { NotFoundError } from "../errors/customErrors.js";
import type { CreateAddressDTO } from "../dtos/address/createAddress.dto.js";
import type { UpdateAddressDTO } from "../dtos/address/updateAddress.dto.js";
import { logger } from "../utils/logger.js";

export default class AddressService {
  constructor(private addressRepository = new AddressRepository()) {}

  async getByUser(userId: number) {
    const addresses = await this.addressRepository.getByUser(userId);
    logger.info(`Endereços listados: usuário ${userId}`);
    return addresses;
  }

  async list(userId: number) {
    return this.getByUser(userId);
  }

  async getById(addressId: number, userId: number) {
    const address = await this.addressRepository.getById(addressId, userId);

    if (!address) {
      throw new NotFoundError("Endereço não encontrado");
    }

    return address;
  }

  async create(dto: CreateAddressDTO) {
    const result = await this.addressRepository.create({
      id: 0,
      user_id: dto.userId,
      street: dto.street,
      city: dto.city,
      state: dto.state,
      zip: dto.zip,
    });

    logger.info(`Endereço criado: usuário ${dto.userId}`);
    return {
      id: result.insertId,
      user_id: dto.userId,
      street: dto.street,
      city: dto.city,
      state: dto.state,
      zip: dto.zip,
    };
  }

  async update(addressId: number, dto: UpdateAddressDTO) {
    const changes: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
    } = {};

    if (dto.street !== undefined) changes.street = dto.street;
    if (dto.city !== undefined) changes.city = dto.city;
    if (dto.state !== undefined) changes.state = dto.state;
    if (dto.zip !== undefined) changes.zip = dto.zip;

    await this.addressRepository.update(addressId, dto.userId, changes);

    logger.info(`Endereço atualizado: ${addressId}`);

    return {
      addressId,
      userId: dto.userId,
      ...changes,
    };
  }

  async delete(addressId: number, userId: number) {
    await this.addressRepository.delete(addressId, userId);

    logger.info(`Endereço removido: ${addressId}`);

    return {
      addressId,
      userId,
      deleted: true,
    };
  }
}
