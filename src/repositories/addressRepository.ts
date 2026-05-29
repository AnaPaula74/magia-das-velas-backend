import { connection } from "../config/database.js";
import { NotFoundError } from "../errors/customErrors.js";
import { logger } from "../utils/logger.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

interface Address {
  id: number;
  user_id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  created_at?: Date;
}

interface AddressRow extends RowDataPacket, Address {}

export default class AddressRepository {
  async getByUser(userId: number): Promise<Address[]> {
    const [rows] = (await connection.query(
      "SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    )) as [AddressRow[], unknown];

    logger.info(`Endereços consultados para usuário ${userId}`);

    return rows;
  }

  async getById(id: number, userId: number): Promise<Address | null> {
    const [rows] = (await connection.query(
      "SELECT * FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    )) as [AddressRow[], unknown];

    return rows[0] ?? null;
  }

  async create(address: Address): Promise<ResultSetHeader> {
    const { user_id, street, city, state, zip } = address;

    const [result] = (await connection.query(
      `INSERT INTO addresses
        (user_id, street, city, state, zip)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, street, city, state, zip]
    )) as [ResultSetHeader, unknown];

    logger.info(`Endereço criado para usuário ${user_id}`);

    return result;
  }

  async update(
    id: number,
    userId: number,
    address: Partial<Address>
  ): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (address.street !== undefined) {
      fields.push("street = ?");
      values.push(address.street);
    }

    if (address.city !== undefined) {
      fields.push("city = ?");
      values.push(address.city);
    }

    if (address.state !== undefined) {
      fields.push("state = ?");
      values.push(address.state);
    }

    if (address.zip !== undefined) {
      fields.push("zip = ?");
      values.push(address.zip);
    }

    if (!fields.length) {
      return;
    }

    values.push(id, userId);

    const [result] = (await connection.query(
      `UPDATE addresses
       SET ${fields.join(", ")}
       WHERE id = ? AND user_id = ?`,
      values
    )) as [ResultSetHeader, unknown];

    if (result.affectedRows === 0) {
      throw new NotFoundError("Endereço não encontrado");
    }

    logger.info(`Endereço atualizado: ID ${id}, usuário ${userId}`);
  }

  async delete(id: number, userId: number): Promise<void> {
    const [result] = (await connection.query(
      `DELETE FROM addresses
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    )) as [ResultSetHeader, unknown];

    if (result.affectedRows === 0) {
      throw new NotFoundError("Endereço não encontrado");
    }

    logger.info(`Endereço removido: ID ${id}, usuário ${userId}`);
  }
}
