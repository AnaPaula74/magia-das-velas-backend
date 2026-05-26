// src/services/userService.ts

import UserRepository from "../repositories/userRepository.js";

import { ConflictError, NotFoundError } from "../errors/customErrors.js";

import type { UpdateProfileDTO } from "../dtos/user/updateProfile.dto.js";

export default class UserService {
  constructor(
    private userRepository =
      new UserRepository()
  ) {}

  async updateProfile(
    dto: UpdateProfileDTO
  ): Promise<void> {
    const user =
      await this.userRepository.getById(
        dto.userId
      );

    if (!user) {
      throw new NotFoundError(
        "Usuário não encontrado"
      );
    }

    const email = dto.email ?? user.email;

    if (email !== user.email) {
      const existing = await this.userRepository.findByEmailOptional(email);

      if (existing && existing.id !== dto.userId) {
        throw new ConflictError("E-mail já cadastrado");
      }
    }

    await this.userRepository.updateProfile(
      dto.userId,
      dto.name ?? user.name,
      email,
      dto.phone ?? user.phone ?? ""
    );
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    const { password: _password, ...profile } = user;

    return profile;
  }
}
