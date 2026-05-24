import UserRepository from "../repositories/UserRepository.js";
import { NotFoundError } from "../errors/customErrors.js";

const repo = new UserRepository();

export default class UserService {
  async updateProfile(id: number, name: string, email: string, phone: string): Promise<void> {
    const user = await repo.getById(id);
    if (!user) throw new NotFoundError("Usuário não encontrado");
    await repo.updateProfile(id, name, email, phone);
  }
}
