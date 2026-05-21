import mysql from "mysql2/promise";
import { logger } from "../utils/logger.js";

// Configuração do pool de conexões usando variáveis de ambiente
const {
  DB_HOST = "localhost",
  DB_PORT = "3306", 
  DB_USER = "root",
  DB_PASSWORD = "root123",
  DB_NAME = "magia_das_velas",
} = process.env;

export const connection = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Testa conexão inicial para garantir disponibilidade
export async function connectDatabase() {
  try {
    const conn = await connection.getConnection();
    logger.info("Conexão com o banco estabelecida");
    conn.release();
  } catch (err) {
    logger.error("Erro ao conectar ao banco", { error: err });
    throw err;
  }
}
