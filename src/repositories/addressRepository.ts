// src/repositories/addressRepository.ts
import { connection } from "../config/database.js";
import type { Address } from "../models/Address.js";

export default class AddressRepository {
  async getByUser(userId: number): Promise<Address[]> {
    const [rows]: any = await connection.query("SELECT * FROM addresses WHERE user_id = ?", [userId]);
    return rows as Address[];
  }

  async create(address: Address): Promise<void> {
    const { user_id, street, city, state, zip } = address;
    await connection.query(
      "INSERT INTO addresses (user_id, street, city, state, zip) VALUES (?, ?, ?, ?, ?)",
      [user_id, street, city, state, zip]
    );
  }

  async update(id: number, address: Address): Promise<void> {
    const { street, city, state, zip } = address;
    await connection.query(
      "UPDATE addresses SET street = ?, city = ?, state = ?, zip = ? WHERE id = ?",
      [street, city, state, zip, id]
    );
  }

  async delete(id: number): Promise<void> {
    await connection.query("DELETE FROM addresses WHERE id = ?", [id]);
  }
}
