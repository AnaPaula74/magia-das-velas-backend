import dotenv from "dotenv";
import mysql from "mysql2/promise";
import argon2 from "argon2";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "magia_das_velas",
};

async function main() {
  const connection = await mysql.createConnection(dbConfig);

  const name = process.env.SEED_ADMIN_NAME ?? "Admin";
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@magiadasvelas.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123456";

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  await connection.query(
    `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, 'admin')
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        role = 'admin'
    `,
    [name, email, passwordHash]
  );

  await connection.end();

  console.log("Admin seed criado/atualizado com sucesso.");
  console.log(`Email: ${email}`);
  console.log(`Senha padrão: ${password}`);
}

main().catch((error) => {
  console.error("Erro ao criar admin seed:", error);
  process.exit(1);
});