import { connection } from "../config/database.js";
import { logger } from "../utils/logger.js";

// serviço de produtos
export class ProductService {
  async createProduct(name: string, description: string, price: number, image_url: string, stock: number) {
    const [result] = await connection.query(
      "INSERT INTO products (name, description, price, image_url, stock) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, image_url, stock]
    );
    logger.info(`Produto criado: ${name}`);
    return result;
  }

  async getProducts(limit: number = 10, offset: number = 0, search: string = "", order: string = "DESC") {
    const [rows] = await connection.query(
      `SELECT * FROM products
       WHERE name LIKE ?
       ORDER BY created_at ${order === "ASC" ? "ASC" : "DESC"}
       LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, offset]
    );
    logger.info(`Produtos listados: busca="${search}", ordem=${order}, limite=${limit}, offset=${offset}`);
    return rows;
  }

  async getProductById(id: number) {
    const [rows]: any = await connection.query("SELECT * FROM products WHERE id = ?", [id]);
    if (!rows[0]) {
      logger.warn(`Produto não encontrado: ID ${id}`);
    } else {
      logger.info(`Produto consultado: ID ${id}`);
    }
    return rows[0];
  }

  async updateProduct(id: number, name: string, description: string, price: number, image_url: string, stock: number) {
    const [result] = await connection.query(
      "UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, stock = ? WHERE id = ?",
      [name, description, price, image_url, stock, id]
    );
    logger.info(`Produto atualizado: ID ${id}`);
    return result;
  }

  async deleteProduct(id: number) {
    const [result] = await connection.query("DELETE FROM products WHERE id = ?", [id]);
    logger.info(`Produto deletado: ID ${id}`);
    return result;
  }
}
