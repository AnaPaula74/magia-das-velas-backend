import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "magia_das_velas",
  multipleStatements: true,
};

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("resetDatabase não pode ser executado em produção.");
  }

  const connection = await mysql.createConnection(dbConfig);

  await connection.query("SET FOREIGN_KEY_CHECKS = 0");

  const tables = [
    "schema_seeds",
    "schema_migrations",
    "refresh_tokens",
    "password_resets",
    "audit_logs",
    "wishlist",
    "reviews",
    "payments",
    "order_items",
    "orders",
    "cart_items",
    "addresses",
    "products",
    "categories",
    "users",
  ];

  for (const table of tables) {
    await connection.query(`DROP TABLE IF EXISTS ${table}`);
    console.log(`Tabela removida: ${table}`);
  }

  await connection.query("SET FOREIGN_KEY_CHECKS = 1");

  await connection.end();

  console.log("Banco resetado com sucesso.");
}

main().catch((error) => {
  console.error("Erro ao resetar banco:", error);
  process.exit(1);
});