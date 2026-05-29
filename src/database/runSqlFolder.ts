import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const folderNameArg = process.argv[2];
const historyTableArg = process.argv[3];

if (!folderNameArg || !historyTableArg) {
  console.error(
    "Uso: tsx src/database/runSqlFolder.ts <migrations|seeds> <history_table>"
  );
  process.exit(1);
}

const allowedFolders = ["migrations", "seeds"] as const;
const allowedHistoryTables = ["schema_migrations", "schema_seeds"] as const;

type SqlFolder = (typeof allowedFolders)[number];
type HistoryTable = (typeof allowedHistoryTables)[number];

function isAllowedFolder(value: string): value is SqlFolder {
  return allowedFolders.includes(value as SqlFolder);
}

function isAllowedHistoryTable(value: string): value is HistoryTable {
  return allowedHistoryTables.includes(value as HistoryTable);
}

if (!isAllowedFolder(folderNameArg)) {
  console.error("Pasta inválida. Use apenas: migrations ou seeds.");
  process.exit(1);
}

if (!isAllowedHistoryTable(historyTableArg)) {
  console.error(
    "Tabela de histórico inválida. Use apenas: schema_migrations ou schema_seeds."
  );
  process.exit(1);
}

const folderName = folderNameArg;
const historyTable = historyTableArg;

const dbConfig = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "magia_das_velas",
  multipleStatements: true,
};

async function main() {
  const connection = await mysql.createConnection(dbConfig);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${historyTable} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const folderPath = path.resolve("src", "database", folderName);

  const files = (await fs.readdir(folderPath))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const [existing] = await connection.query(
      `SELECT id FROM ${historyTable} WHERE filename = ? LIMIT 1`,
      [file]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`Ignorado: ${file}`);
      continue;
    }

    const sql = await fs.readFile(path.join(folderPath, file), "utf8");

    console.log(`Executando: ${file}`);

    await connection.query(sql);

    await connection.query(
      `INSERT INTO ${historyTable} (filename) VALUES (?)`,
      [file]
    );

    console.log(`Concluído: ${file}`);
  }

  await connection.end();

  console.log("Finalizado com sucesso.");
}

main().catch((error) => {
  console.error("Erro ao executar SQL:", error);
  process.exit(1);
});
