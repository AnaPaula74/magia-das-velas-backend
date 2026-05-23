import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

// Carrega variáveis de ambiente ANTES de usá-las
dotenv.config();

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
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

// Testa conexão inicial
export async function connectDatabase() {
  try {
    const conn = await connection.getConnection();
    logger.info(`Conexão com o banco ${DB_NAME} estabelecida usando usuário ${DB_USER}`);
    conn.release();
  } catch (err) {
    logger.error("Erro ao conectar ao banco", { error: err });
    throw err;
  }
}
