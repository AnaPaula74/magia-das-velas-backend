import mysql from "mysql2/promise";
import type { Pool, PoolConnection } from "mysql2/promise";
import { logger } from "../utils/logger.js";
import { env, isTest } from "./env.js";

const testConnection = {
  query: async () => [[], []],

  getConnection: async () => ({
    query: async () => [[], []],
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
  }),

  end: async () => {},
} as unknown as Pool;

export const connection = isTest
  ? testConnection
  : mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

export async function connectDatabase() {
  if (isTest) {
    logger.info("Banco mockado no ambiente de testes");
    return;
  }

  try {
    const conn: PoolConnection = await connection.getConnection();

    logger.info(
      `Conexão com o banco ${env.DB_NAME} estabelecida usando usuário ${env.DB_USER}`
    );

    conn.release();
  } catch (err) {
    logger.error("Erro ao conectar ao banco", {
      error: err,
    });

    throw err;
  }
}
