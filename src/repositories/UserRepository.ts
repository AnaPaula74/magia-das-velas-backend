import { connection } from "../config/database.js";
import { logger } from "../utils/logger.js";
import { NotFoundError } from "../errors/customErrors.js";

export default class UserRepository {
  async findByEmail(email: string) {
    const [rows]: any = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    // lança erro se usuário não existir
    if (!user) {
      logger.warn(`Usuário não encontrado: ${email}`);
      throw new NotFoundError("Usuário não encontrado");
    }
    return user;
  }

  async create(name: string, email: string, password: string) {
    const [result] = await connection.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );
    logger.info(`Usuário criado: ${email}`);
    return result;
  }
}
